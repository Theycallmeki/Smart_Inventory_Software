const express = require('express');
const Item = require('../models/item');
const SalesHistory = require('../models/salesHistory');

const router = express.Router();



// GET sales history
router.get('/', async (req, res) => {
  try {
    const sales = await SalesHistory.findAll({ include: [{ model: Item }] });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE sales record
router.post('/', async (req, res) => {
  const { itemId, date, quantitySold } = req.body;
  try {
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (item.quantity < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const sale = await SalesHistory.create({ itemId, date, quantitySold });
    item.quantity -= quantitySold;
    await item.save();

    res.status(201).json({ sale, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYMONGO CHECKOUT SESSION (GCash) ---
const PAYMONGO_SECRET_KEY = 'sk_test_ZmAd5jPPHWax3XAxbyrQPexq';

// Create Checkout Session (GCash)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    console.log('🔹 Creating checkout session with cart:', cart);

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const line_items = cart.map(item => ({
      name: item.name,
      amount: Math.round(Number(item.price) * 100),
      currency: 'PHP',
      quantity: item.quantity,
    }));

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64'),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method_types: ['gcash'],
            line_items,
            cancel_url: 'http://localhost:3000/cancel',
            success_url: 'http://localhost:3000/success',
            metadata: { cart: JSON.stringify(cart) },
          },
        },
      }),
    });

    const data = await response.json();
    console.log('Checkout session created:', data);

    res.json({
      checkoutUrl: data.data.attributes.checkout_url,
      sessionId: data.data.id,
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Success 
router.get('/success', (req, res) => {
  res.send('Payment successful! Please check your email or dashboard.');
});

// Webhook to handle GCash payment confirmation
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    console.log("Incoming PayMongo Webhook:", event?.data?.attributes?.type);

    const eventType = event?.data?.attributes?.type;

    if (eventType === "checkout_session.payment.paid") {
      console.log("Payment confirmed via PayMongo (GCash). Updating inventory...");

      const session = event.data.attributes.data.attributes;
      const cart = session.metadata?.cart ? JSON.parse(session.metadata.cart) : [];

      if (!cart.length) {
        console.warn("No cart data found in metadata — inventory not updated.");
      }

      for (const item of cart) {
        const dbItem = await Item.findOne({ where: { barcode: item.barcode } });
        if (dbItem) {
          console.log(`Processing item: ${dbItem.name} | Before: ${dbItem.quantity}`);

          // Create sales record
          await SalesHistory.create({
            itemId: dbItem.id,
            date: new Date(),
            quantitySold: item.quantity,
          });

          // Update inventory
          dbItem.quantity -= item.quantity;
          await dbItem.save();

          console.log(`Updated inventory for ${dbItem.name}: New quantity = ${dbItem.quantity}`);
        } else {
          console.warn(`Item not found in database for barcode: ${item.barcode}`);
        }
      }

      console.log("Inventory successfully updated after payment!");
    } else {
      console.log(`Ignored event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error during inventory update:", err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------- CASH PAYMENT ROUTES -------------------
const path = require("path");

let lastCartFromFrontend = []; // stores the latest cart from frontend
const cashCodes = {}; // { code: { cart, expiresAt } }

// (1) Frontend sends its cart before admin generates code
router.post("/save-cart", (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  lastCartFromFrontend = cart;
  console.log("Cart saved from frontend:", lastCartFromFrontend);
  res.json({ message: "Cart saved successfully" });
});

// (2) Admin page to open generator
router.get("/cash-generate", (req, res) => {
  const filePath = path.join(__dirname, "../views/cash.html");
  res.sendFile(filePath);
});

// (3) Admin generates code using last cart
router.post("/admin/generate-cash-code", async (req, res) => {
  try {
    const cart = lastCartFromFrontend;
    if (!cart || cart.length === 0) {
      return res
        .status(400)
        .json({ error: "No cart data available. Please save cart first." });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old/used codes before saving new one
    Object.keys(cashCodes).forEach((key) => {
      if (Date.now() > cashCodes[key].expiresAt) delete cashCodes[key];
    });

    cashCodes[code] = {
      cart,
      expiresAt: Date.now() + 5 * 60 * 1000, // expires in 5 min
    };

    console.log(`Admin generated cash code: ${code}`);
    res.json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// (4) Confirm cash payment — validate code, record sale, and update inventory
router.post("/confirm-cash", async (req, res) => {
  try {
    const { code } = req.body;
    const entry = cashCodes[code];

    if (!entry) return res.status(400).json({ error: "Invalid or expired code" });
    if (Date.now() > entry.expiresAt)
      return res.status(400).json({ error: "Code expired" });

    const cart = entry.cart;

    // Update inventory + sales history
    for (const item of cart) {
      const dbItem = await Item.findOne({ where: { barcode: item.barcode } });
      if (!dbItem) continue;

      if (dbItem.quantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${dbItem.name}` });
      }

      await SalesHistory.create({
        itemId: dbItem.id,
        date: new Date(),
        quantitySold: item.quantity,
      });

      dbItem.quantity -= item.quantity;
      await dbItem.save();
    }

    // Mark code as used (remove from memory)
    delete cashCodes[code];
    console.log(`Cash payment confirmed, code ${code} used.`);

    res.json({ message: "Cash payment confirmed and recorded successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

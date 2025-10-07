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
  const PAYMONGO_SECRET_KEY = 'sk_live_C4JPkSo44cQ4bJDsxmb65ZZy';

  // Create Checkout Session
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
              payment_method_types: ['gcash','cash'],
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

  // Webhook to handle payment confirmation
  router.post('/webhook', express.json(), async (req, res) => {
    try {
      const event = req.body;
      console.log("Incoming PayMongo Webhook");
      console.log("Event:", event?.data?.attributes?.type);

      const eventType = event?.data?.attributes?.type;

      if (eventType === "checkout_session.payment.paid") {
        const session = event.data.attributes.data.attributes;
        const cart = session.metadata?.cart ? JSON.parse(session.metadata.cart) : [];

        console.log("Cart received from webhook:", JSON.stringify(cart, null, 2));

        for (const item of cart) {
          const dbItem = await Item.findOne({ where: { barcode: item.barcode } });
          if (dbItem) {
            // Record sale
            const sale = await SalesHistory.create({
              itemId: dbItem.id,
              date: new Date(),
              quantitySold: item.quantity,
            });
            
            // Update inventory
            dbItem.quantity -= item.quantity;
            await dbItem.save();

            console.log(" Payment Success - Updated Records:");
            console.log("  Item:", dbItem.name);
            console.log("  Sold Quantity:", item.quantity);
            console.log("  Remaining Stock:", dbItem.quantity);
            console.log("  Sales History Entry:", {
              id: sale.id,
              itemId: sale.itemId,
              date: sale.date,
              quantitySold: sale.quantitySold,
            });
          } else {
            console.warn("Item not found in DB for barcode:", item.barcode);
          }
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: err.message });
    }
  });

// In-memory storage for demo purposes
const cashCodes = {}; // { code: { cart, expiresAt } }

// Generate 6-digit code for cash payment
router.post('/cash-code', async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // Generate 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code and cart with 5-minute expiry
    cashCodes[code] = { cart, expiresAt: Date.now() + 5 * 60 * 1000 };

    // Send code to frontend
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm cash payment with 6-digit code
router.post('/confirm-cash', async (req, res) => {
  try {
    const { code } = req.body;
    const entry = cashCodes[code];
    if (!entry) return res.status(400).json({ error: 'Invalid or expired code' });
    if (Date.now() > entry.expiresAt) return res.status(400).json({ error: 'Code expired' });

    const cart = entry.cart;

    for (const item of cart) {
      const dbItem = await Item.findOne({ where: { barcode: item.barcode } });
      if (!dbItem) continue;
      if (dbItem.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${dbItem.name}` });
      }

      await SalesHistory.create({
        itemId: dbItem.id,
        date: new Date(),
        quantitySold: item.quantity,
      });

      dbItem.quantity -= item.quantity;
      await dbItem.save();
    }

    // Remove code after use
    delete cashCodes[code];

    res.json({ message: 'Cash payment confirmed and recorded!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  module.exports = router;

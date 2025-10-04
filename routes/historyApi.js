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

module.exports = router;

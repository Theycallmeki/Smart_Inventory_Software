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

// Checkout (barcode-based)
router.post('/checkout', async (req, res) => {
  const { cart, paymentMethod } = req.body;
  try {
    for (const cartItem of cart) {
      const item = await Item.findOne({ where: { barcode: cartItem.barcode } });
      if (!item) continue;

      if (item.quantity < cartItem.quantity) continue;

      item.quantity -= cartItem.quantity;
      await item.save();

      await SalesHistory.create({
        itemId: item.id,
        quantitySold: cartItem.quantity,
        date: new Date()
      });
    }
    res.json({ success: true, message: 'Checkout completed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

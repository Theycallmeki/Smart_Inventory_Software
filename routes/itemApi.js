const express = require('express');
const Item = require('../models/item');

const router = express.Router();

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET item by barcode
router.get('/barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const item = await Item.findOne({ where: { barcode } });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE item
router.post('/', async (req, res) => {
  const { name, quantity, category, price, barcode } = req.body;
  const validCategories = Item.rawAttributes.category.values;

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Allowed: ${validCategories.join(', ')}` });
  }

  try {
    const item = await Item.create({ name, quantity, category, price, barcode });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, quantity, barcode } = req.body;

  try {
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (category && !Item.rawAttributes.category.values.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Allowed: ${Item.rawAttributes.category.values.join(', ')}` });
    }

    item.name = name ?? item.name;
    item.category = category ?? item.category;
    item.barcode = barcode ?? item.barcode;
    if (price !== undefined) item.price = price;
    if (quantity !== undefined) item.quantity = quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

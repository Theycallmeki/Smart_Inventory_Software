const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Item = require('../models/item');
const SalesHistory = require('../models/salesHistory');
const User = require('../models/user');

// --- USER AUTH ---

// Register
// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.redirect('/auth?error=exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.redirect('/auth?success=registered');
  } catch (err) {
    console.log('❌ Register Error:', err);  // <-- Added for debugging
    res.redirect('/auth?error=server');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.redirect('/auth?error=notfound');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/auth?error=wrongpass');

    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    console.log('❌ Login Error:', err);  // <-- Added for debugging
    res.redirect('/auth?error=server');
  }
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth');
  });
});

// --- ITEM CRUD ---

// GET all items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET item by barcode
router.get('/items/barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;

  try {
    const item = await Item.findOne({ where: { barcode } });

    if (!item) {
      return res.status(404).json({ error: 'Item not found for barcode: ' + barcode });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE item
router.post('/items', async (req, res) => {
  const { name, quantity, category, price, barcode } = req.body;
  const validCategories = Item.rawAttributes.category.values;

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Allowed: ${validCategories.join(', ')}` });
  }

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required.' });
  }

  try {
    const item = await Item.create({ name, quantity, category, price, barcode });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE item
router.put('/items/:id', async (req, res) => {
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
router.delete('/items/:id', async (req, res) => {
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

// --- SALES HISTORY ---

// GET sales history
router.get('/sales-history', async (req, res) => {
  try {
    const sales = await SalesHistory.findAll({ include: [{ model: Item }] });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE sales record
router.post('/sales-history', async (req, res) => {
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

module.exports = router;

const express = require('express'); 
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./db');
const Item = require('./models/item');
const SalesHistory = require('./models/salesHistory');

const app = express();
const PORT = 3005;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Sync DB
sequelize.sync().then(() => {
  console.log('✅ Database synced.');
});

// Serve home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Serve item.html
app.get('/item', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'item.html'));
});

// Serve admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Serve salesHistory.html page
app.get('/sales-history', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'salesHistory.html'));
});

// Serve prediction.html page
app.get('/prediction', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'prediction.html'));
});

// API: Get all items
app.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create item
app.post('/items', async (req, res) => {
  const { name, quantity, category, price } = req.body;
  try {
    const item = await Item.create({ name, quantity, category, price });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Update name/category/price/quantity
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, quantity } = req.body;
  try {
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.name = name || item.name;
    item.category = category || item.category;
    if (price !== undefined) item.price = price;
    if (quantity !== undefined) item.quantity = quantity;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Delete item
app.delete('/items/:id', async (req, res) => {
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

// API: Get all sales history with associated Item data
app.get('/api/sales-history', async (req, res) => {
  try {
    const sales = await SalesHistory.findAll({
      include: [{ model: Item }]
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create a new sales history record and update item quantity
app.post('/api/sales-history', async (req, res) => {
  const { itemId, date, quantitySold } = req.body;

  try {
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (item.quantity < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Create the sales history record
    const sale = await SalesHistory.create({ itemId, date, quantitySold });

    // Decrease the item quantity
    item.quantity -= quantitySold;
    await item.save();

    res.status(201).json({ sale, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

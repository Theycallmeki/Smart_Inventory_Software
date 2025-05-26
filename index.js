const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./db');
const Item = require('./models/item');

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

// API: Get all items
app.get('/items', async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// API: Create item
app.post('/items', async (req, res) => {
  const { name, quantity, category, price } = req.body;  // Added price here
  try {
    const item = await Item.create({ name, quantity, category, price });  // Include price in create
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Update name/category/quantity
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, quantity } = req.body;  // Added quantity here
  try {
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.name = name || item.name;
    item.category = category || item.category;
    if (price !== undefined) item.price = price;
    if (quantity !== undefined) item.quantity = quantity;  // Update quantity here
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

const SalesHistory = require('./models/salesHistory'); // add this at top with other requires

// Serve salesHistory.html page
// Serve the sales history HTML page
app.get('/sales-history', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'salesHistory.html'));
});

// API: Get all sales history records with associated Item data
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

// API: Create a new sales history record
app.post('/api/sales-history', async (req, res) => {
  const { itemId, date, quantitySold } = req.body;
  try {
    const sale = await SalesHistory.create({ itemId, date, quantitySold });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

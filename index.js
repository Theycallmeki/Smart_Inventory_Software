// index.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const sequelize = require('./db');

const app = express();
const PORT = 3005;

// ✅ Enable CORS for React frontend (CRA default is http://localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'Nx7jK3Zp!eVr9Q2Lm0tCfYz^BwA6hGdu', // 🔐 Dev-only secret
  resave: false,
  saveUninitialized: false
}));

// Make session available in templates (if using views)
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ✅ Routes
app.use('/', require('./routes/pages'));                 // Frontend pages
app.use('/api/auth', require('./routes/authApi'));       // Auth routes
app.use('/api/items', require('./routes/itemApi'));      // Item CRUD
app.use('/api/sales-history', require('./routes/historyApi')); // Sales history + checkout
app.use('/api/ai', require('./routes/aiApi'));           // AI endpoints


// ✅ Start server
sequelize.sync().then(() => {
  console.log('✅ Database synced.');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

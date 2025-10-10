// index.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const sequelize = require('./db');

const app = express();

// ✅ Render assigns PORT automatically, fallback for local dev
const PORT = process.env.PORT || 3005;

// ✅ Allow CORS from local React + deployed Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3000',                   // Local dev
    'https://pi-mart-client.vercel.app'  // Deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'Nx7jK3Zp!eVr9Q2Lm0tCfYz^BwA6hGdu', // 🔐 Use env var in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
    sameSite: 'None' // required for cross-origin cookies
  }
}));

// Make session available in templates (if using views)
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ✅ Routes
app.use('/', require('./routes/pages'));           // Frontend pages
app.use('/api/auth', require('./routes/authApi')); // Auth routes
app.use('/api/items', require('./routes/itemApi')); 
app.use('/api/sales-history', require('./routes/historyApi')); 
app.use('/api/ai', require('./routes/aiApi'));     

// ✅ Trust proxy for secure cookies on Render/Vercel
app.enable('trust proxy');

// ✅ Start server after DB sync
sequelize.sync().then(() => {
  console.log('✅ Database synced.');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

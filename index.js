// No need to load dotenv since we're hardcoding the secret for local use
// require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./db');
const app = express();
const PORT = 3005;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'Nx7jK3Zp!eVr9Q2Lm0tCfYz^BwA6hGdu', // 🔐 Secret hardcoded for development only
  resave: false,
  saveUninitialized: false
}));

// Optional: make session accessible in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Routes
app.use('/', require('./routes/pages'));
app.use('/api', require('./routes/api'));

// Start server
sequelize.sync().then(() => {
  console.log('✅ Database synced.');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

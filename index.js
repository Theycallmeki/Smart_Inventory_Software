const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./db');
const app = express();
const PORT = 3005;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/', require('./routes/pages'));
app.use('/api', require('./routes/api'));

// Sync DB and start server
sequelize.sync().then(() => {
  console.log('✅ Database synced.');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

// db.js
const { Sequelize } = require('sequelize');

// PostgreSQL connection using Render credentials
const sequelize = new Sequelize(
  'defense_6r8n',                // Database name
  'defense_6r8n_user',           // Username
  '8bD5nLRSkdCAVJI5vR3cmoKmEqqx8cII', // Password
  {
    host: 'dpg-d3knmuemcj7s7387po6g-a.singapore-postgres.render.com', // External host
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,          // SSL required for Render
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

module.exports = sequelize;

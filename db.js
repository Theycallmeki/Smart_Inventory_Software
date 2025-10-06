// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nigga', 'postgres', '12345678', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;

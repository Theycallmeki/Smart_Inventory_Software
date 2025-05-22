const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './inventory.sqlite',
});

module.exports = sequelize;

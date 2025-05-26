// models/SalesHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Item = require('./item');

const SalesHistory = sequelize.define('SalesHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Item,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // <-- set default to current date

  },
  quantitySold: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false, // disable createdAt/updatedAt if not needed
  tableName: 'sales_history', // optional: set a specific table name
});

// Define associations
Item.hasMany(SalesHistory, { foreignKey: 'itemId', onDelete: 'CASCADE' });
SalesHistory.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = SalesHistory;

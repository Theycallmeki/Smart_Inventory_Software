const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.ENUM(
      'Fruits',
      'Vegetables',
      'Meat',
      'Seafood',
      'Dairy',
      'Beverages',
      'Snacks',
      'Bakery',
      'Frozen',
      'Canned Goods',
      'Condiments',
      'Dry Goods',
      'Grains & Pasta',
      'Spices & Seasonings',
      'Breakfast & Cereal',
      'Personal Care',
      'Household',
      'Baby Products',
      'Pet Supplies',
      'Health & Wellness',
      'Cleaning Supplies'
    ),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
});

module.exports = Item;

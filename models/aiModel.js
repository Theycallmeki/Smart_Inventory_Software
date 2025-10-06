// models/AiModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Item = require('./item');

const AiModel = sequelize.define('AiModel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Item,
      key: 'id',
    },
  },
  modelType: {
    type: DataTypes.STRING,
    defaultValue: 'linear-regression',
  },
  period: {
    type: DataTypes.INTEGER, // ✅ 7 or 30 days
    allowNull: false,
    defaultValue: 7,
  },
  quantities: {
    type: DataTypes.JSON, // store historical data used for training
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ai_models',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['itemId', 'period'], // ✅ allow one model per (item, period)
    },
  ],
});

Item.hasMany(AiModel, { foreignKey: 'itemId', onDelete: 'CASCADE' });
AiModel.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = AiModel;

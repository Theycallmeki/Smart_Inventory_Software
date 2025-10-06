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
    unique: true, // one model per item
  },
  modelType: {
    type: DataTypes.STRING,
    defaultValue: 'linear-regression',
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
});

Item.hasOne(AiModel, { foreignKey: 'itemId', onDelete: 'CASCADE' });
AiModel.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = AiModel;

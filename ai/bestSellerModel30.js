// ai/bestSellerModel30Day.js
const { Op } = require('sequelize');
const SalesHistory = require('../models/salesHistory');
const Item = require('../models/item');
const AiModel = require('../models/AiModel');

/**
 * Prepare last 30 days of sales
 */
async function prepareData(itemId) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await SalesHistory.findAll({
      where: {
        itemId,
        date: { [Op.gte]: thirtyDaysAgo },
      },
      order: [['date', 'ASC']],
    });

    const quantities = sales.map(s => Number(s.quantitySold)).filter(q => !isNaN(q));
    return quantities.length ? quantities : null;
  } catch (err) {
    console.error(`prepareData error for itemId ${itemId}:`, err);
    return null;
  }
}

/**
 * Simple linear regression
 */
function linearRegressionPredict(quantities) {
  const n = quantities.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = quantities;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return Math.round(intercept + slope * (n + 1));
}

/**
 * Train and save model for one item (30-day)
 */
async function trainAndSaveModel(itemId) {
  const quantities = await prepareData(itemId);
  if (!quantities) return null;

  const modelType = quantities.length < 2 ? 'average' : 'linear-regression';

  // ✅ Save with period = 30
  await AiModel.upsert({
    itemId,
    modelType,
    quantities,
    period: 30,
    updatedAt: new Date(),
  });

  return true;
}

/**
 * Predict next quantity using stored model (30-day)
 */
async function predictItem(itemId, period = 30) {
  const model = await AiModel.findOne({ where: { itemId, period } });
  if (!model) return null;

  const { modelType, quantities } = model;
  if (modelType === 'linear-regression') return Math.max(0, linearRegressionPredict(quantities));

  const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length;
  return Math.round(avg);
}

/**
 * Train all items (30-day)
 */
async function trainModel() {
  try {
    const items = await Item.findAll();
    for (let item of items) {
      await trainAndSaveModel(item.id);
    }
    return '✅ All 30-day models trained and saved to database!';
  } catch (err) {
    console.error('trainModel error:', err);
    throw new Error('Failed to train 30-day model');
  }
}

/**
 * Recommend top predicted best sellers (30-day)
 */
async function recommendBestSellers(limit = 5) {
  try {
    const items = await Item.findAll();
    const predictions = [];

    for (let item of items) {
      const nextQty = await predictItem(item.id, 30);
      if (nextQty !== null && !isNaN(nextQty)) {
        predictions.push({
          itemId: item.id,
          item: item.name,
          predictedNext: nextQty,
        });
      }
    }

    predictions.sort((a, b) => b.predictedNext - a.predictedNext);
    return predictions.slice(0, limit);
  } catch (err) {
    console.error('recommendBestSellers error:', err);
    return [];
  }
}

module.exports = { recommendBestSellers, trainModel };

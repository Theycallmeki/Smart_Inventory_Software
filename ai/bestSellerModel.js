const tf = require('@tensorflow/tfjs'); // TensorFlow.js
const { Op } = require('sequelize');
const SalesHistory = require('../models/salesHistory');
const Item = require('../models/item');

// In-memory storage for trained models
const trainedModels = {};

/**
 * Prepare training data for one item (based on quantitySold over the past 7 days)
 */
async function prepareData(itemId) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sales = await SalesHistory.findAll({
      where: { 
        itemId,
        date: { [Op.gte]: sevenDaysAgo } // ✅ only last 7 days
      },
      order: [['date', 'ASC']], // oldest → newest
    });

    const quantities = sales
      .map(s => Number(s.quantitySold))
      .filter(q => !isNaN(q));

    if (quantities.length === 0) return null;

    return { quantities };
  } catch (err) {
    console.error(`prepareData error for itemId ${itemId}:`, err);
    return null;
  }
}

/**
 * Train model for one item and store it in memory
 * Uses simple linear regression (trend detection)
 */
async function trainAndSaveModel(itemId) {
  const data = await prepareData(itemId);
  if (!data) return null;

  const { quantities } = data;

  if (quantities.length < 2) {
    trainedModels[itemId] = { model: null, avg: quantities[0] || 0 };
    return true;
  }

  // Store quantities for regression instead of training NN
  trainedModels[itemId] = { model: 'linear-regression', quantities };
  return true;
}

/**
 * Simple linear regression for trend prediction
 */
function linearRegressionPredict(quantities) {
  const n = quantities.length;
  const x = Array.from({ length: n }, (_, i) => i + 1); // [1..n]
  const y = quantities;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return Math.round(intercept + slope * (n + 1)); // predict next day
}

/**
 * Predict next quantity for one item
 */
async function predictItem(itemId) {
  const saved = trainedModels[itemId];
  if (!saved) return null; // model not trained yet

  if (saved.model === 'linear-regression') {
    return Math.max(0, linearRegressionPredict(saved.quantities));
  }

  return Math.round(saved.avg || 0); // fallback
}

/**
 * Recommend best sellers (AI predicted)
 */
async function recommendBestSellers(limit = 5) {
  try {
    const items = await Item.findAll();
    const predictions = [];

    for (let item of items) {
      const nextQty = await predictItem(item.id);
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
    console.error("recommendBestSellers error:", err);
    return [];
  }
}

/**
 * Train all models (for /api/train-model)
 */
async function trainModel() {
  try {
    const items = await Item.findAll();
    for (let item of items) {
      try {
        await trainAndSaveModel(item.id);
      } catch (err) {
        console.error(`Failed to train item ${item.id}:`, err);
      }
    }
    return "All item models trained successfully!";
  } catch (err) {
    console.error("trainModel error:", err);
    throw new Error("Failed to train model");
  }
}

// Export
module.exports = { recommendBestSellers, trainModel };

// routes/aiApi.js
const express = require('express');
const router = express.Router();

// Import both AI models
const { recommendBestSellers, trainModel } = require('../ai/bestSellerModel'); // 7-day model
const { recommendBestSellers: recommendBestSellers30, trainModel: trainModel30 } = require('../ai/bestSellerModel30'); // 30-day model

/**
 * ✅ Train 7-day model
 */
router.get('/train-model', async (req, res) => {
  try {
    const message = await trainModel();
    res.json({ success: true, message });
  } catch (err) {
    console.error('Error training 7-day model:', err);
    res.status(500).json({ success: false, message: 'Failed to train 7-day model' });
  }
});

/**
 * ✅ Train 30-day model
 */
router.get('/train-model-30', async (req, res) => {
  try {
    const message = await trainModel30();
    res.json({ success: true, message });
  } catch (err) {
    console.error('Error training 30-day model:', err);
    res.status(500).json({ success: false, message: 'Failed to train 30-day model' });
  }
});

/**
 * ✅ Get 7-day AI best sellers
 */
router.get('/best-sellers', async (req, res) => {
  try {
    const data = await recommendBestSellers();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error getting 7-day best sellers:', err);
    res.status(500).json({ success: false, message: 'Failed to get 7-day best sellers' });
  }
});

/**
 * ✅ Get 30-day AI best sellers
 */
router.get('/best-sellers-30', async (req, res) => {
  try {
    const data = await recommendBestSellers30();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error getting 30-day best sellers:', err);
    res.status(500).json({ success: false, message: 'Failed to get 30-day best sellers' });
  }
});

module.exports = router;

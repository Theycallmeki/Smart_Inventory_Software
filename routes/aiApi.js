const express = require('express');
const { recommendBestSellers, trainModel } = require('../ai/bestSellerModel');

const router = express.Router();

// Train all item models
router.get('/train-model', async (req, res) => {
  try {
    const msg = await trainModel();
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get best seller predictions
router.get('/best-sellers', async (req, res) => {
  try {
    const results = await recommendBestSellers(5);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

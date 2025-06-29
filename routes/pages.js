const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/home.html')));
router.get('/item', (req, res) => res.sendFile(path.join(__dirname, '../views/item.html')));
router.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../views/admin.html')));
router.get('/sales-history', (req, res) => res.sendFile(path.join(__dirname, '../views/salesHistory.html')));
router.get('/prediction', (req, res) => res.sendFile(path.join(__dirname, '../views/prediction.html')));

module.exports = router;

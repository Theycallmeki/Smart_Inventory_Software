const express = require('express');
const path = require('path');
const router = express.Router();
const ensureAuthenticated = require('../middleware/auth');

router.get('/', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/home.html')));
router.get('/item', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/item.html')));
router.get('/admin', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/admin.html')));
router.get('/sales-history', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/salesHistory.html')));
router.get('/prediction', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/prediction.html')));
router.get('/auth', (req, res) => res.sendFile(path.join(__dirname, '../views/auth.html')));
router.get('/pos', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views/pos.html')));

module.exports = router;

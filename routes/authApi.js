const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.redirect('/auth?error=exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/auth?success=registered');
  } catch (err) {
    console.log('❌ Register Error:', err);
    res.redirect('/auth?error=server');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.redirect('/auth?error=notfound');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/auth?error=wrongpass');

    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    console.log('❌ Login Error:', err);
    res.redirect('/auth?error=server');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth');
  });
});

module.exports = router;

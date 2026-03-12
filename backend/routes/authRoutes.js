const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Private routes
router.get('/me', protect, getMe);

module.exports = router;
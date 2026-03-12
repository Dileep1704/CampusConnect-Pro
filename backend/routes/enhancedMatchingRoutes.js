const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEnhancedMatches,
  getResumeFeedback,
  vectorSearch,
  trainRankingModel
} = require('../controllers/enhancedMatchingController');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/enhanced-matches', authorize('student'), getEnhancedMatches);
router.get('/resume-feedback', authorize('student'), getResumeFeedback);
router.get('/vector-search', vectorSearch);

// Admin only
router.post('/train-model', authorize('admin'), trainRankingModel);

module.exports = router;
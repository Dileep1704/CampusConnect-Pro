const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/security/advancedAuth');
const {
  getStudentMatches,
  getJobCandidates,
  compareCandidates
} = require('../controllers/matchingController');

// All matching routes are protected
router.use(protect);

/**
 * @route   GET /api/matching/student-matches
 * @desc    Get AI-powered matches for current student
 * @access  Private (Student only)
 */
router.get('/student-matches', 
  hasPermission('view:internships'),
  getStudentMatches
);

/**
 * @route   GET /api/matching/job-candidates/:jobId
 * @desc    Get AI-ranked candidates for a specific job
 * @access  Private (Company only)
 */
router.get('/job-candidates/:jobId',
  hasPermission('view:applications'),
  getJobCandidates
);

/**
 * @route   POST /api/matching/compare-candidates
 * @desc    Compare multiple candidates for a job
 * @access  Private (Company only)
 */
router.post('/compare-candidates',
  hasPermission('view:applications'),
  compareCandidates
);

/**
 * @route   GET /api/matching/health
 * @desc    Check if matching service is running
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Matching service is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
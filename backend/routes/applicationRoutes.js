const express = require('express');
const router = express.Router();
const {
  applyToInternship,
  getMyApplications,
  getCompanyApplications,
  updateApplicationStatus,
  withdrawApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

// Student routes
router.get('/my-applications', protect, getMyApplications);
router.post('/', protect, applyToInternship);
router.delete('/:id', protect, withdrawApplication);

// Company routes
router.get('/company/applications', protect, getCompanyApplications);
router.patch('/:id/status', protect, updateApplicationStatus);

module.exports = router;
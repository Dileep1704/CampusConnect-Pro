const express = require('express');
const router = express.Router();
const {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getCompanyInternships
} = require('../controllers/internshipController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getInternships);
router.get('/:id', getInternshipById);

// Company routes
router.get('/company/my-posts', protect, getCompanyInternships);
router.post('/', protect, createInternship);
router.put('/:id', protect, updateInternship);
router.delete('/:id', protect, deleteInternship);

module.exports = router;
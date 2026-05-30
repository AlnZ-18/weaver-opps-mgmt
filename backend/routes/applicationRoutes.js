const express = require('express');
const {
  applyForOpportunity,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

// ==========================================
// Student Protected Routes
// ==========================================
router.post('/:opportunityId', protect, restrictTo('student'), applyForOpportunity);
router.get('/my-applications', protect, restrictTo('student'), getMyApplications);

// ==========================================
// Admin Protected Routes
// ==========================================
router.get('/admin/all', protect, restrictTo('admin'), getAllApplications);
router.get('/admin/:id', protect, restrictTo('admin'), getApplicationById);
router.patch('/admin/:id/status', protect, restrictTo('admin'), updateApplicationStatus);

module.exports = router;

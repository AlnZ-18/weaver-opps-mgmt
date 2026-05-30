const express = require('express');
const {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes (Students and guests can view opportunities)
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Admin-only protected routes
router.post('/', protect, restrictTo('admin'), createOpportunity);
router.put('/:id', protect, restrictTo('admin'), updateOpportunity);
router.delete('/:id', protect, restrictTo('admin'), deleteOpportunity);

module.exports = router;

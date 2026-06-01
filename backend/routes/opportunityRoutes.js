const express = require('express');
const {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getAdminAllOpportunities,
  getPublicOpportunities,
  getPublicOpportunityById,
} = require('../controllers/opportunityController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { validateOpportunity } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public Endpoints (No Auth Required)
router.get('/', getPublicOpportunities);
router.get('/:id', getPublicOpportunityById);

// Enforce authentication and administrative authorization globally for all Opportunity CRUD routes
router.use(authenticateUser);
router.use(authorizeAdmin);

// CRUD Endpoints for Admins
router.post('/', validateOpportunity, createOpportunity);
router.put('/:id', validateOpportunity, updateOpportunity);
router.delete('/:id', deleteOpportunity);
router.get('/admin/all', getAdminAllOpportunities);

module.exports = router;

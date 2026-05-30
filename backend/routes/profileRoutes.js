const express = require('express');
const { createProfile, getMyProfile, updateProfile } = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// All profile endpoints require active user authentication
router.use(authenticateUser);

router.post('/create', createProfile);
router.get('/me', getMyProfile);
router.put('/update', updateProfile);

module.exports = router;

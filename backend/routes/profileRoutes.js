const express = require('express');
const { createProfile, getMyProfile, updateProfile, uploadResumeFile } = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

const router = express.Router();

// All profile endpoints require active user authentication
router.use(authenticateUser);

router.post('/create', createProfile);
router.get('/me', getMyProfile);
router.put('/update', updateProfile);
router.post('/upload-resume', uploadResume, uploadResumeFile);

module.exports = router;

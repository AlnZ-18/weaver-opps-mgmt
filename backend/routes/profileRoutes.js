const express = require('express');
const { updateProfile, uploadResumeFile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

const router = express.Router();

// All profile endpoints require student authentication
router.use(protect);
router.use(restrictTo('student'));

router.put('/', updateProfile);
router.post('/resume', uploadResume, uploadResumeFile);

module.exports = router;

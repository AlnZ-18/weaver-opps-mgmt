const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Update student profile details
 * @route   PUT /api/profile
 * @access  Private/Student
 */
const updateProfile = async (req, res, next) => {
  try {
    const { university, phone, currentDegree, graduationYear, skills, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.role !== 'student') {
      return next(new AppError('Only student users have profiles to manage.', 400));
    }

    // Update profile fields safely
    if (university) user.profile.university = university;
    if (phone) user.profile.phone = phone;
    if (currentDegree !== undefined) user.profile.currentDegree = currentDegree;
    if (graduationYear !== undefined) user.profile.graduationYear = graduationYear;
    if (skills !== undefined) user.profile.skills = Array.isArray(skills) ? skills : [skills];
    if (bio !== undefined) user.profile.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user.profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or update student PDF resume
 * @route   POST /api/profile/resume
 * @access  Private/Student
 */
const uploadResumeFile = async (req, res, next) => {
  try {
    // 1. Verify file was sent
    if (!req.file) {
      return next(new AppError('Please select a valid PDF file to upload.', 400));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    let resumeUrl = '';
    let resumePublicId = '';

    // ==========================================
    // 2. Cloudinary Upload Path (Active Cloud)
    // ==========================================
    if (isCloudinaryConfigured) {
      // Helper function to upload buffer using write stream
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const writeStream = cloudinary.uploader.upload_stream(
            {
              folder: 'aiesec_resumes',
              resource_type: 'image', // Support thumbnails & PDF display natively
              format: 'pdf',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          writeStream.write(fileBuffer);
          writeStream.end();
        });
      };

      // Execute upload
      const uploadResult = await uploadFromBuffer(req.file.buffer);
      resumeUrl = uploadResult.secure_url;
      resumePublicId = uploadResult.public_id;

      // Delete previous resume from Cloudinary (clean-up storage)
      if (user.profile.resumePublicId) {
        cloudinary.uploader.destroy(user.profile.resumePublicId).catch((err) => {
          console.error('[Cloudinary Cleanup Error]: Fail to delete older asset', err);
        });
      }
    }
    // ==========================================
    // 3. Local Disk Storage Fallback
    // ==========================================
    else {
      // Local URL structure
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      resumeUrl = `${hostUrl}/uploads/${req.file.filename}`;
      resumePublicId = req.file.filename; // Use local filename as cleanup key

      // Delete previous local file to save storage space
      if (user.profile.resumePublicId) {
        const oldPath = path.join(__dirname, '../uploads/', user.profile.resumePublicId);
        fs.unlink(oldPath, (err) => {
          if (err) {
            // Log warning but don't fail upload
            console.warn(`[Local Cleanup Warning]: Older asset file ${user.profile.resumePublicId} was not found.`);
          }
        });
      }
    }

    // 4. Update student's database profile references
    user.profile.resumeUrl = resumeUrl;
    user.profile.resumePublicId = resumePublicId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume document uploaded and registered successfully.',
      resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  uploadResumeFile,
};

const Profile = require('../models/Profile');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new student profile
 * @route   POST /api/profile/create
 * @access  Private
 */
const createProfile = async (req, res, next) => {
  try {
    const { phone, university, course, graduationYear, linkedin, skills } = req.body;

    // 1. Ensure the user doesn't already have an active profile card
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return next(new AppError('Profile already exists. Please use the update endpoint to modify details.', 400));
    }

    // 2. Validate essential creation parameters proactively
    if (!phone || !university || !course || !graduationYear) {
      return next(new AppError('Please provide all required profile fields: phone, university, course, and graduationYear.', 400));
    }

    // 3. Persist new profile (Mongoose validates university enums and linkedin regexes automatically)
    const profile = await Profile.create({
      userId: req.user._id,
      phone,
      university,
      course,
      graduationYear,
      linkedin: linkedin || '',
      skills: skills || [],
      profileCompleted: true, // Marked complete as all required parameters are supplied
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve logged-in user's profile details
 * @route   GET /api/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    // Find profile linked to logged-in user
    const profile = await Profile.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    
    if (!profile) {
      return next(new AppError('No profile found. Please navigate to the creation page first.', 404));
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/profile/update
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { phone, university, course, graduationYear, linkedin, skills } = req.body;

    // 1. Verify that the profile exists
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return next(new AppError('Profile not found. Please create your profile card first.', 404));
    }

    // 2. Update allowed fields safely
    if (phone !== undefined) profile.phone = phone;
    if (university !== undefined) profile.university = university;
    if (course !== undefined) profile.course = course;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : [skills];

    // Mark as complete if mandatory fields are met
    profile.profileCompleted = !!(profile.phone && profile.university && profile.course && profile.graduationYear);

    // 3. Save Mongoose document (executes schema validations)
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
};

const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * Helper to build custom sanitized user response
 */
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.role === 'student' ? user.profile : undefined,
    createdAt: user.createdAt,
  };
};

/**
 * @desc    Register a new user (Student or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, university, phone, currentDegree, graduationYear } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // 2. Prepare user object based on role
    const userData = {
      name,
      email,
      password,
      role: role || 'student',
    };

    // 3. Validation logic for student profiles
    if (userData.role === 'student') {
      if (!university || !phone) {
        return next(new AppError('Student registration requires specifying a valid university and phone number.', 400));
      }

      userData.profile = {
        university,
        phone,
        currentDegree: currentDegree || '',
        graduationYear: graduationYear || null,
        skills: [],
        bio: '',
      };
    }

    // 4. Create and persist user in MongoDB
    const user = await User.create(userData);

    // 5. Generate session token
    const token = generateToken(user._id);

    // 6. Return response
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check for email and password input existence
    if (!email || !password) {
      return next(new AppError('Please provide an email and password to log in.', 400));
    }

    // 2. Fetch user and explicitly select password field (which is select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials. Please verify your email and password.', 401));
    }

    // 3. Compare passwords using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials. Please verify your email and password.', 401));
    }

    // 4. Generate JWT
    const token = generateToken(user._id);

    // 5. Return success
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already fetched and attached by the protect middleware
    res.status(200).json({
      success: true,
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

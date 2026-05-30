const User = require('../models/User');
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
    createdAt: user.createdAt,
  };
};

/**
 * @desc    Register a new user (user or admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // 2. Create new user (password is auto-hashed in Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // 3. Generate signed JSON Web Token using schema method
    const token = user.generateJWT();

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
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Fetch user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials. Please verify your email and password.', 401));
    }

    // 2. Compare passwords using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials. Please verify your email and password.', 401));
    }

    // 3. Generate signed JSON Web Token using schema method
    const token = user.generateJWT();

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
 * @desc    Get logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is pre-fetched and attached by the protect middleware
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

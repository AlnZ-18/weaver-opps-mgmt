const { AppError } = require('./errorMiddleware');

/**
 * Helper to validate email format using standard RFC 5322 regex
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Middleware to validate user registration input payloads
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new AppError('Please provide a valid name (at least 2 characters long).', 400));
  }

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Please provide a secure password (at least 6 characters long).', 400));
  }

  if (role && !['user', 'admin'].includes(role)) {
    return next(new AppError('Access Role must be strictly either "user" or "admin".', 400));
  }

  next();
};

/**
 * Middleware to validate user login input payloads
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!password) {
    return next(new AppError('Please provide your login password.', 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};

const { AppError } = require('./errorMiddleware');

/**
 * Middleware to restrict route access to specific user roles
 * @param {...string} roles - Array of allowed roles (e.g. 'admin', 'student')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by protect middleware
    if (!req.user) {
      return next(
        new AppError('Authorization failed: User identity context was not found. Ensure route is protected.', 500)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Access Denied: You do not have permissions to perform this action.', 403)
      );
    }

    next();
  };
};

module.exports = {
  restrictTo,
};

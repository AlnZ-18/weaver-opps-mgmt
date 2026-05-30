const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');

/**
 * Middleware to protect routes: verifies JSON Web Token (JWT)
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Access Denied: Please provide a valid Bearer authentication token to access this resource.', 401)
    );
  }

  try {
    // 1. Decode and verify the signature of the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');

    // 2. Fetch the corresponding user from the database (safely omitting password)
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError('Authentication failed: The user belonging to this session token no longer exists.', 401)
      );
    }

    // 3. Attach user context to the request stream
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Authentication failed: Invalid or expired token signature.', 401));
  }
};

/**
 * Middleware to restrict route access to specific user roles (RBAC)
 * @param {...string} roles - Array of allowed roles (e.g. 'admin', 'user')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
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
  protect,
  restrictTo,
};

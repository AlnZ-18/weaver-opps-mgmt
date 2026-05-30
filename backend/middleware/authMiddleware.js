const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');

/**
 * Middleware to verify JWT and attach user object to req.user (Protect private routes)
 */
const authenticateUser = async (req, res, next) => {
  let token;

  // Extract Bearer token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Access Denied: Please provide a valid Bearer authentication token to access this private resource.', 401)
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
 * Middleware to restrict route access strictly to administrator users (Restrict admin routes)
 */
const authorizeAdmin = (req, res, next) => {
  // authenticateUser middleware must be executed first to populate req.user
  if (!req.user) {
    return next(
      new AppError('Authorization failed: User identity context was not found. Ensure route is protected by authenticateUser first.', 500)
    );
  }

  // Restrict to admin role
  if (req.user.role !== 'admin') {
    return next(
      new AppError('Access Denied: Administrative permissions are required to access this resource.', 403)
    );
  }

  next();
};

module.exports = {
  authenticateUser,
  authorizeAdmin,
};

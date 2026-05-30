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

  // Fallback: Check if token is present in cookies (if client decides to pass it there)
  // else if (req.cookies && req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(
      new AppError('Access Denied: Please provide an authentication token to access this resource.', 401)
    );
  }

  try {
    // 1. Decode and verify the signature of the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Fetch the corresponding user from the database
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

module.exports = {
  protect,
};

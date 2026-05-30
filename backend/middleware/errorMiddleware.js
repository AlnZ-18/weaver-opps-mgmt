/**
 * Custom Error Class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all non-operational unexpected server exceptions
  if (err.statusCode === 500) {
    console.error('\x1b[31m[System Error] Internal Server Exception:\x1b[0m', err);
  }

  // Handle Mongoose Bad ObjectID format
  if (err.name === 'CastError') {
    err = new AppError(`Invalid resource identifier for path: ${err.path}`, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    err = new AppError(`Validation constraints failed: ${messages.join('. ')}`, 400);
  }

  // Handle Mongoose duplicate key violations (MongoDB Code 11000)
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'Unknown';
    err = new AppError(`Duplicate entry value: ${value}. Please use a unique value.`, 400);
  }

  // Handle JWT Validation Issues
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid or expired authentication token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Send Error Response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || 'An unexpected error occurred on the server.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  AppError,
  errorHandler,
};

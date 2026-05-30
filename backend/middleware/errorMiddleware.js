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
 * Global Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log critical 500 system failures
  if (err.statusCode === 500) {
    console.error('\x1b[31m[System Error] Internal Server Exception:\x1b[0m', err);
  }

  // Handle Mongoose Bad ObjectID formats (CastError)
  if (err.name === 'CastError') {
    err = new AppError(`Invalid resource identifier for path: ${err.path}`, 400);
  }

  // Handle Mongoose model validation failures
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    err = new AppError(`Validation constraints failed: ${messages.join('. ')}`, 400);
  }

  // Handle Mongoose duplicate key index violations
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'Unknown';
    err = new AppError(`Duplicate entry value: ${value}. Please use a unique value.`, 400);
  }

  // Handle JSON Web Token signature exceptions
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid or expired authentication token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Dispatch standard error JSON response
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

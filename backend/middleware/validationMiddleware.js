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

/**
 * Middleware to validate Opportunity creation/update payloads
 */
const validateOpportunity = (req, res, next) => {
  const { title, programType, country, city, description, stipend, duration, applicationDeadline, status, skillsRequired } = req.body;

  // Validate required fields
  if (!title || !title.trim()) {
    return next(new AppError('Please provide an opportunity title.', 400));
  }
  if (title.trim().length > 100) {
    return next(new AppError('Title cannot exceed 100 characters.', 400));
  }

  if (!programType) {
    return next(new AppError('Please specify program type (GTa/GV).', 400));
  }
  if (!['GTa', 'GV'].includes(programType)) {
    return next(new AppError('exchange program type is invalid. Must be either GTa or GV.', 400));
  }

  if (!country || !country.trim()) {
    return next(new AppError('Please specify country destination location.', 400));
  }

  if (!city || !city.trim()) {
    return next(new AppError('Please specify city destination location.', 400));
  }

  if (!description || !description.trim()) {
    return next(new AppError('Please provide a program description.', 400));
  }

  if (!stipend || !stipend.trim()) {
    return next(new AppError('Please provide stipend details.', 400));
  }

  if (duration === undefined) {
    return next(new AppError('Please specify program duration in weeks.', 400));
  }
  const durationNum = Number(duration);
  if (isNaN(durationNum) || durationNum < 2) {
    return next(new AppError('Duration must be at least 2 weeks.', 400));
  }

  if (!applicationDeadline) {
    return next(new AppError('Please specify the application deadline date.', 400));
  }
  const deadlineDate = new Date(applicationDeadline);
  if (isNaN(deadlineDate.getTime())) {
    return next(new AppError('Please specify a valid application deadline date.', 400));
  }

  if (status && !['Open', 'Closed'].includes(status)) {
    return next(new AppError('Status must be strictly either "Open" or "Closed".', 400));
  }

  if (skillsRequired && !Array.isArray(skillsRequired)) {
    return next(new AppError('Skills required must be an array of strings.', 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOpportunity,
};

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing the user ID
 * @param {string} id - User Document ID
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

module.exports = {
  generateToken,
};

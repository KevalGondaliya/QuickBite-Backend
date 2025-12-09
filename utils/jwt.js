const jwt = require('jsonwebtoken');

/**
 * Sign JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

module.exports = {
  signToken,
};


const catchAsync = require('../utils/catchAsync');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  // Get customer from token
  const customer = await Customer.findById(decoded.id);

  if (!customer) {
    return next(new AppError('The customer belonging to this token no longer exists.', 401));
  }

  if (!customer.isActive) {
    return next(new AppError('Your account is not active. Please contact support.', 401));
  }

  // Grant access to protected route
  req.customer = customer;
  next();
});

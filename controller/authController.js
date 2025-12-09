const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

const createSendToken = (customer, statusCode, res, message) => {
  const token = signToken(customer._id);

  // Remove password from output
  customer.password = undefined;

  return response(res, statusCode, true, message, {
    customer: {
      id: customer._id,
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      location: customer.location,
      zone: customer.zone,
      isFirstOrder: customer.isFirstOrder,
    },
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, location, zone } = req.body;

  if (!name || !email || !password || !location || !zone) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return next(new AppError('Email already exists. Please use a different one.', 400));
  }

  // Validate zone
  if (!['Urban', 'Suburban', 'Remote'].includes(zone)) {
    return next(new AppError('Invalid zone. Must be Urban, Suburban, or Remote', 400));
  }

  // Validate location
  if (!location.lat || !location.lng) {
    return next(new AppError('Please provide valid location (lat and lng)', 400));
  }

  // Create customer
  const customer = await Customer.create({
    name,
    email,
    password,
    location,
    zone,
  });

  return createSendToken(customer, 201, res, 'Customer registered successfully');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Find customer and include password field
  const customer = await Customer.findOne({ email }).select('+password');

  if (!customer) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!customer.isActive) {
    return next(new AppError('Your account is not active. Please contact support.', 400));
  }

  // Check password
  const isMatch = await customer.correctPassword(password, customer.password);

  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  return createSendToken(customer, 200, res, 'Customer logged in successfully');
});

exports.getMe = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.customer._id);

  return response(res, 200, true, 'Customer retrieved successfully', {
    customer: {
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      location: customer.location,
      zone: customer.zone,
      isFirstOrder: customer.isFirstOrder,
      createdAt: customer.createdAt,
    },
  });
});


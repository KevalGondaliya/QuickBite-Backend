const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');

/**
 * Create a new restaurant
 * POST /restaurants
 */
exports.createRestaurant = catchAsync(async (req, res, next) => {
  const { name, location, zone } = req.body;

  if (!name || !location || !zone) {
    return next(new AppError('Please provide name, location, and zone', 400));
  }

  // Validate zone
  if (!['Urban', 'Suburban', 'Remote'].includes(zone)) {
    return next(new AppError('Invalid zone. Must be Urban, Suburban, or Remote', 400));
  }

  // Check if restaurant with same name already exists
  const existingRestaurant = await Restaurant.findOne({ name });
  if (existingRestaurant) {
    return next(new AppError('Restaurant with this name already exists', 400));
  }

  // Create restaurant
  const restaurant = await Restaurant.create({
    name,
    location,
    zone,
    isActive: true,
  });

  return response(res, 201, true, 'Restaurant created successfully', restaurant);
});

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.find({ isActive: true }).sort({ createdAt: -1 });

  const restaurantsData = restaurants.map((restaurant) => ({
    restaurantId: restaurant.restaurantId,
    name: restaurant.name,
    location: restaurant.location,
    zone: restaurant.zone,
    isActive: restaurant.isActive,
    createdAt: restaurant.createdAt,
  }));

  return response(res, 200, true, 'Restaurants retrieved successfully', restaurants);
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findOne({
    $or: [{ _id: id }, { restaurantId: id }],
  });

  if (!restaurant) {
    return next(new AppError('Restaurant not found', 404));
  }

  return response(res, 200, true, 'Restaurant retrieved successfully', restaurant);
});
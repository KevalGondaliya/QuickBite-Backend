const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const Item = require('../models/Item');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');

exports.createItem = catchAsync(async (req, res, next) => {
  const { name, price, restaurantId, isAvailable } = req.body;

  if (!name || price === undefined || !restaurantId) {
    return next(new AppError('Please provide name, price, and restaurantId', 400));
  }

  // Validate restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new AppError('Restaurant not found', 404));
  }

  // Validate price
  if (typeof price !== 'number' || isNaN(price)) {
    return next(new AppError('Price must be a valid number', 400));
  }

  if (price < 0) {
    return next(new AppError('Price must be a positive number', 400));
  }

  const item = await Item.create({
    name,
    price,
    restaurantId,
    isAvailable: isAvailable ?? true,
  });

  return response(res, 201, true, 'Item created successfully', item);
});

exports.getAllItems = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.query;

  let query = {};
  if (restaurantId) {
    const restaurant = await Restaurant.findOne({
      $or: [{ _id: restaurantId }, { restaurantId: restaurantId }],
    });
    if (restaurant) {
      query.restaurantId = restaurant._id;
    }
  }

  const items = await Item.find(query)
    .populate('restaurantId', 'restaurantId name')
    .sort({ createdAt: -1 });

  const itemsData = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    restaurantId: item.restaurantId?.restaurantId || item.restaurantId,
    restaurantName: item.restaurantId?.name,
    isAvailable: item.isAvailable,
    createdAt: item.createdAt,
  }));

  return response(res, 200, true, 'Items retrieved successfully', itemsData);
});

exports.getItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const item = await Item.findById(id).populate('restaurantId', 'restaurantId name');

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  return response(res, 200, true, 'Item retrieved successfully', item);
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, isAvailable } = req.body;

  const item = await Item.findById(id);

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  // Update fields
  if (name) {
    if (typeof name !== 'string') {
      return next(new AppError('name must be a string', 400));
    }
    item.name = name;
  }
  if (price !== undefined) {
    // Validate it's a number
    if (typeof price !== 'number' || isNaN(price)) {
      return next(new AppError('price must be a valid number', 400));
    }
    if (price < 0) {
      return next(new AppError('Price must be a positive number', 400));
    }
    item.price = price;
  }
  if (isAvailable !== undefined) {
    if (typeof isAvailable !== 'boolean') {
      return next(new AppError('isAvailable must be a boolean (true or false)', 400));
    }
    item.isAvailable = isAvailable;
  }

  await item.save();

  return response(res, 200, true, 'Item updated successfully', item);
});

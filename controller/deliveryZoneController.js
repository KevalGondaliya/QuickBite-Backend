const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const DeliveryZone = require('../models/DeliveryZone');
const AppError = require('../utils/AppError');

exports.createDeliveryZone = catchAsync(async (req, res, next) => {
  const { zoneType, baseFee, perKmRate } = req.body;

  if (!zoneType || baseFee === undefined || perKmRate === undefined) {
    return next(new AppError('Please provide zoneType, baseFee, and perKmRate', 400));
  }

  // Validate zone type
  if (!['Urban', 'Suburban', 'Remote'].includes(zoneType)) {
    return next(new AppError('Invalid zoneType. Must be Urban, Suburban, or Remote', 400));
  }

  // Check if zone already exists
  const existingZone = await DeliveryZone.findOne({ zoneType });
  if (existingZone) {
    return next(new AppError(`Delivery zone '${zoneType}' already exists`, 400));
  }

  // Validate fees are numbers
  if (typeof baseFee !== 'number' || isNaN(baseFee)) {
    return next(new AppError('baseFee must be a valid number', 400));
  }
  if (typeof perKmRate !== 'number' || isNaN(perKmRate)) {
    return next(new AppError('perKmRate must be a valid number', 400));
  }
  if (baseFee < 0 || perKmRate < 0) {
    return next(new AppError('baseFee and perKmRate must be positive numbers', 400));
  }

  // Create delivery zone
  const zone = await DeliveryZone.create({
    zoneType,
    baseFee,
    perKmRate,
    isActive: true,
  });

  return response(res, 201, true, 'Delivery zone created successfully', zone);
});

exports.getAllDeliveryZones = catchAsync(async (req, res, next) => {
  const zones = await DeliveryZone.find().sort({ zoneType: 1 });

  const zonesData = zones.map((zone) => ({
    id:zone.id,
    zoneType: zone.zoneType,
    baseFee: zone.baseFee,
    perKmRate: zone.perKmRate,
    isActive: zone.isActive,
    createdAt: zone.createdAt,
  }));

  return response(res, 200, true, 'Delivery zones retrieved successfully', zonesData);
});

exports.getDeliveryZone = catchAsync(async (req, res, next) => {
  const { zoneType } = req.params;

  const zone = await DeliveryZone.findOne({ zoneType });

  if (!zone) {
    return next(new AppError('Delivery zone not found', 404));
  }

  const zoneData = {
    id: zone.id,
    zoneType: zone.zoneType,
    baseFee: zone.baseFee,
    perKmRate: zone.perKmRate,
    isActive: zone.isActive,
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt,
  };

  return response(res, 200, true, 'Delivery zone retrieved successfully', zoneData);
});

exports.updateDeliveryZone = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { baseFee, perKmRate, isActive } = req.body;

  const zone = await DeliveryZone.findById(id);

  if (!zone) {
    return next(new AppError('Delivery zone not found', 404));
  }

  // Update fields
  if (baseFee !== undefined) {
    if (baseFee < 0) {
      return next(new AppError('baseFee must be a positive number', 400));
    }
    zone.baseFee = baseFee;
  }

  if (perKmRate !== undefined) {
    if (perKmRate < 0) {
      return next(new AppError('perKmRate must be a positive number', 400));
    }
    zone.perKmRate = perKmRate;
  }

  if (isActive !== undefined) {
    zone.isActive = isActive;
  }

  await zone.save();

  const zoneData = {
    zoneType: zone.zoneType,
    baseFee: zone.baseFee,
    perKmRate: zone.perKmRate,
    isActive: zone.isActive,
    updatedAt: zone.updatedAt,
  };

  return response(res, 200, true, 'Delivery zone updated successfully', zoneData);
});


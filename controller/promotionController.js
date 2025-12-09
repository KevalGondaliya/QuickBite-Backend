const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const Promotion = require('../models/Promotion');
const AppError = require('../utils/AppError');

exports.createPromotion = catchAsync(async (req, res, next) => {
  const {
    promoCode,
    name,
    type,
    discountValue,
    discountType,
    restaurantId,
    zoneType,
    minOrderAmount,
    maxDiscountAmount,
    startDate,
    endDate,
    usageLimit,
  } = req.body;

  if (!promoCode || !name || !type || discountValue === undefined || !discountType || !startDate || !endDate) {
    return next(new AppError('Missing required fields', 400));
  }

  const formattedPromoCode = promoCode.trim().toUpperCase();

  // Check existing promo
  const existingPromo = await Promotion.findOne({ promoCode: formattedPromoCode });
  if (existingPromo) {
    return next(new AppError('Promotion code already exists', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) return next(new AppError('endDate must be after startDate', 400));

  let promotion;
  try {
    promotion = await Promotion.create({
      promoCode: formattedPromoCode,
      name,
      type,
      discountValue,
      discountType,
      restaurantId: restaurantId || null,
      zoneType: zoneType || null,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: start,
      endDate: end,
      usageLimit: usageLimit || null,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Promo code already exists, pick another', 400));
    }
    throw error;
  }

  return response(res, 201, true, 'Promotion created successfully', promotion);
});

exports.getAllPromotions = catchAsync(async (req, res, next) => {
  const { isActive } = req.query;

  let query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const promotions = await Promotion.find(query).sort({ createdAt: -1 });

  const promotionsData = promotions.map((promo) => ({
    promoCode: promo.promoCode,
    name: promo.name,
    type: promo.type,
    discountValue: promo.discountValue,
    discountType: promo.discountType,
    restaurantId: promo.restaurantId,
    zoneType: promo.zoneType,
    minOrderAmount: promo.minOrderAmount,
    maxDiscountAmount: promo.maxDiscountAmount,
    startDate: promo.startDate,
    endDate: promo.endDate,
    usageLimit: promo.usageLimit,
    isActive: promo.isActive,
    usedCount: promo.usedCount,
    createdAt: promo.createdAt,
  }));

  return response(res, 200, true, 'Promotions retrieved successfully', promotionsData);
});

exports.getPromotion = catchAsync(async (req, res, next) => {
  const { promoCode } = req.params;

  const promotion = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });

  if (!promotion) {
    return next(new AppError('Promotion not found', 404));
  }

  const promoData = {
    promoCode: promotion.promoCode,
    name: promotion.name,
    type: promotion.type,
    discountValue: promotion.discountValue,
    discountType: promotion.discountType,
    restaurantId: promotion.restaurantId,
    zoneType: promotion.zoneType,
    minOrderAmount: promotion.minOrderAmount,
    maxDiscountAmount: promotion.maxDiscountAmount,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    usageLimit: promotion.usageLimit,
    isActive: promotion.isActive,
    usedCount: promotion.usedCount,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };

  return response(res, 200, true, 'Promotion retrieved successfully', promoData);
});

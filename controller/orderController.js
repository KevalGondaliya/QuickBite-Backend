const catchAsync = require('../utils/catchAsync');
const response = require('../middleware/response');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');
const Item = require('../models/Item');
const DeliveryZone = require('../models/DeliveryZone');
const Promotion = require('../models/Promotion');
const { generateOrderNumber } = require('../utils/orderHelper');
const { getPeakMultiplier } = require('../utils/dateHelper');
const AppError = require('../utils/AppError');
const turf = require('@turf/turf');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { customerId, restaurantId, items, promoCode } = req.body;

  // Validate and fetch customer
  const customer = await Customer.findById({ _id :customerId });
  if (!customer) {
    return next(new AppError(`Customer with ID '${customerId}' not found`, 404));
  }

  // Validate and fetch restaurant (by _id or restaurantId string)
  const restaurant = await Restaurant.findOne({
    $or: [{ _id: restaurantId }, { restaurantId: restaurantId }],
  });
  if (!restaurant) {
    return next(new AppError(`Restaurant with ID '${restaurantId}' not found`, 404));
  }

  if (!restaurant.isActive) {
    return next(new AppError('Restaurant is currently inactive', 400));
  }

  // Validate and fetch items, calculate base price
  const orderItems = [];
  let basePrice = 0;

  for (const item of items) {
    // Find item by MongoDB _id
    const product = await Item.findOne({
      _id: item.itemId,
      restaurantId: restaurant._id,
      isAvailable: true,
    });

    if (!product) {
      return next(
        new AppError(`Item with ID '${item.itemId}' not found or unavailable`, 404)
      );
    }

    const subtotal = product.price * item.qty;
    basePrice += subtotal;

    orderItems.push({
      itemId: product._id,
      quantity: item.qty,
    });
  }

  if (orderItems.length === 0) {
    return next(new AppError('Order must contain at least one item', 400));
  }

  // Calculate delivery fee
  const orderDate = new Date();
  
  // Calculate distance
  const distance = turf.distance(turf.point(restaurant.location.coordinates), turf.point(customer.location.coordinates), { units: "kilometers" });

  const distanceKm = Number(distance.toFixed(2));

  // Get zone pricing rules
  const zone = await DeliveryZone.findOne({
    zoneType: customer.zone,
    isActive: true,
  });

  if (!zone) {
    return next(
      new AppError(`Delivery zone '${customer.zone}' not found or inactive`, 404)
    );
  }

  // Calculate base delivery cost
  const baseDeliveryCost = zone.baseFee;
  const distanceCost = distanceKm * zone.perKmRate;
  const subtotalDeliveryFee = baseDeliveryCost + distanceCost;

  // Get peak multiplier
  const peakMultiplier = getPeakMultiplier(orderDate);
  const peakSurcharge = subtotalDeliveryFee * (peakMultiplier - 1);

  // Final delivery fee
  const deliveryFee = subtotalDeliveryFee * peakMultiplier;

  const deliveryFeeDetails = {
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    zoneBaseFee: zone.baseFee,
    distanceKm: distanceKm,
    distanceCost: Math.round(distanceCost * 100) / 100,
    peakMultiplier: peakMultiplier,
    peakSurcharge: Math.round(peakSurcharge * 100) / 100,
  };

  // Apply promotion if provided
  let promoDiscount = 0;
  let appliedPromoCode = null;
  if (promoCode) {
    const promo = await Promotion.findOne({
      promoCode: promoCode.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return next(new AppError('Invalid or inactive promotion code', 400));
    }

    // Check validity dates
    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      return next(new AppError('Promotion code has expired', 400));
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return next(new AppError('Promotion code usage limit reached', 400));
    }

    // Check minimum order amount
    const totalOrderAmount = basePrice + deliveryFeeDetails.deliveryFee;
    if (totalOrderAmount < promo.minOrderAmount) {
      return next(
        new AppError(
          `Minimum order amount of ${promo.minOrderAmount} required for this promotion`,
          400
        )
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (totalOrderAmount * promo.discountValue) / 100;
      if (promo.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
      }
    } else {
      discountAmount = promo.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, totalOrderAmount);

    promoDiscount = Math.round(discountAmount * 100) / 100;
    appliedPromoCode = promo.promoCode;

    // Increment promo usage
    await Promotion.findOneAndUpdate(
      { promoCode: promoCode.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }

  // Calculate total amount
  const totalAmount = basePrice + deliveryFeeDetails.deliveryFee - promoDiscount;

  // Create order
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    userId: customer._id, // MongoDB ObjectId for querying by logged-in user
    restaurantId: restaurant._id, // Store MongoDB ObjectId
    items: orderItems,
    deliveryZone: customer.zone,
    distanceKm: deliveryFeeDetails.distanceKm,
    basePrice: Math.round(basePrice * 100) / 100,
    deliveryFee: deliveryFeeDetails.deliveryFee,
    zoneBaseFee: deliveryFeeDetails.zoneBaseFee,
    distanceCost: deliveryFeeDetails.distanceCost,
    peakMultiplier: deliveryFeeDetails.peakMultiplier,
    peakSurcharge: deliveryFeeDetails.peakSurcharge,
    promoDiscount: promoDiscount,
    promoCode: appliedPromoCode,
    totalAmount: Math.round(totalAmount * 100) / 100,
    status: 'pending',
  });

  return response(res, 201, true, 'Order created successfully', order);
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find order by _id or orderNumber
  const order = await Order.findOne({
    $or: [{ _id: id }, { orderNumber: id }],
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Populate items to get item details
  await order.populate('items.itemId', 'name price');

  // Populate additional details
  const customer = await Customer.findById(order.userId);
  const restaurant = await Restaurant.findById(order.restaurantId);

  // Map items with populated name - handle both populated and non-populated cases
  const itemsWithDetails = order.items.map((item) => {
    const itemId = item.itemId._id || item.itemId;
    const itemName = item.itemId.name ;
    const itemprice = item.itemId.price ;
    
    return {
      itemId: itemId,
      name: itemName,
      price:itemprice,
      quantity: item.quantity,
    };
  });

  const orderData = {
    order: {
      orderNumber: order.orderNumber,
      orderId: order._id,
      userId: order.userId,
      restaurantId: order.restaurantId,
      items: itemsWithDetails,
      deliveryZone: order.deliveryZone,
      distanceKm: order.distanceKm,
      basePrice: order.basePrice,
      deliveryFee: order.deliveryFee,
      zoneBaseFee: order.zoneBaseFee,
      distanceCost: order.distanceCost,
      peakMultiplier: order.peakMultiplier,
      peakSurcharge: order.peakSurcharge,
      promoDiscount: order.promoDiscount,
      promoCode: order.promoCode,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    customer: customer
      ? {
          name: customer.name,
          email: customer.email,
          location: customer.location,
          zone: customer.zone,
        }
      : null,
    restaurant: restaurant
      ? {
          name: restaurant.name,
          location: restaurant.location,
          zone: restaurant.zone,
        }
      : null,
  };

  return response(res, 200, true, 'Order get successfully', orderData);
});

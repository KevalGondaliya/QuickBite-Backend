const AppError = require('../utils/AppError');
const response = require('../middleware/response');

/**
 * Validation middleware for order creation
 */
const validateCreateOrder = (req, res, next) => {
  const { customerId, restaurantId, items, promoCode } = req.body;

  // Required fields
  if (!customerId) {
    return response(res, 400, false, 'customerId is required', null);
  }

  if (!restaurantId) {
    return response(res, 400, false, 'restaurantId is required', null);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return response(
      res,
      400,
      false,
      'items array is required and must contain at least one item',
      null
    );
  }

  // Validate items structure
  for (const item of items) {
    if (!item.itemId) {
      return response(
        res,
        400,
        false,
        'Each item must have an itemId (MongoDB _id)',
        null
      );
    }
    if (!item.qty || item.qty < 1) {
      return response(
        res,
        400,
        false,
        'Each item must have a quantity of at least 1',
        null
      );
    }
  }

  next();
};

module.exports = {
  validateCreateOrder,
};


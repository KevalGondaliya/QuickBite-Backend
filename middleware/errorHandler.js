const AppError = require('../utils/AppError');
const response = require('../middleware/response');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle operational errors (AppError instances)
  if (err.isOperational) {
    return response(res, err.statusCode, false, err.message, null);
  }

  // Handle Mongoose errors
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return response(res, 404, false, message, null);
  }

  if (err.code === 11000) {
    // Extract duplicate field name from error
    const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : 'value';
    const message = `Duplicate ${duplicateField} value entered: ${duplicateValue}. This field must be unique.`;
    
    // If it's productId, provide helpful message
    if (duplicateField === 'productId') {
      const helpMessage = 'Note: productId was removed from the model. Please drop the old index in MongoDB: db.items.dropIndex("productId_1")';
      console.error(helpMessage);
    }
    
    return response(res, 400, false, message, null);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return response(res, 400, false, message, null);
  }

  // Handle unknown errors
  return response(
    res,
    500,
    false,
    'Something went wrong! Please try again later.',
    null
  );
};

module.exports = errorHandler;


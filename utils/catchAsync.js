/**
 * Wrapper function to catch async errors
 * Eliminates the need for try-catch blocks in async route handlers
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;


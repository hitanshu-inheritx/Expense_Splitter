const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER] Unhandled error:', err);
  logger.error('Unhandled error in error middleware', err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  console.log('[404] Route not found:', req.originalUrl);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
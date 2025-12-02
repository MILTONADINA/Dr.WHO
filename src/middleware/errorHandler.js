/**
 * Central error handling middleware
 */

const { ERROR_MESSAGES, HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../utils/errors');

/**
 * Log error details (in production, this would go to a logging service)
 */
const logError = (err, req) => {
  console.error({
    error: err,
    request: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response to client
 */
const sendErrorResponse = (err, req, res) => {
  const { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message } = err;
  
  const response = {
    status: 'error',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.url
  };
  
  // Add validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }
  
  // In development, add stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req);
  
  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return sendErrorResponse({
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors
    }, req, res);
  }
  
  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendErrorResponse({
      statusCode: HTTP_STATUS.CONFLICT,
      message: 'A record with this value already exists'
    }, req, res);
  }
  
  // Handle known operational errors
  if (err instanceof AppError) {
    return sendErrorResponse(err, req, res);
  }
  
  // Handle unknown errors
  sendErrorResponse({
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: process.env.NODE_ENV === 'production' 
      ? ERROR_MESSAGES.GENERIC 
      : err.message
  }, req, res);
};

/**
 * Handle 404 errors for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
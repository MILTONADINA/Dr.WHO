/**
 * Custom error classes for better error handling
 */

const { HTTP_STATUS } = require('../config/constants');

/**
 * Base error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for when a requested resource is not found
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Error for validation failures
 */
class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    this.errors = errors;
  }
}

/**
 * Error for bad requests
 */
class BadRequestError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * Error for database operations
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Error for unauthorized access
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Error for forbidden access
 */
class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * Error for conflicts (e.g., duplicate entries)
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  BadRequestError,
  DatabaseError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};
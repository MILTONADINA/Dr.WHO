/**
 * Standardized response handlers
 */

const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');

/**
 * Send success response
 */
const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK, message = null) => {
  const response = {
    status: 'success',
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Send created response
 */
const sendCreated = (res, data, message = SUCCESS_MESSAGES.CREATED) => {
  sendSuccess(res, data, HTTP_STATUS.CREATED, message);
};

/**
 * Send updated response
 */
const sendUpdated = (res, data, message = SUCCESS_MESSAGES.UPDATED) => {
  sendSuccess(res, data, HTTP_STATUS.OK, message);
};

/**
 * Send deleted response
 */
const sendDeleted = (res, message = SUCCESS_MESSAGES.DELETED) => {
  sendSuccess(res, null, HTTP_STATUS.OK, message);
};

/**
 * Send paginated response
 */
const sendPaginated = (res, data, total, page, limit) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendPaginated
};
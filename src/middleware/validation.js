/**
 * Input validation middleware
 */

const { ValidationError, BadRequestError } = require('../utils/errors');
const { DB_CONSTRAINTS } = require('../config/constants');

/**
 * Validate that a parameter is a positive integer
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return next(new BadRequestError(`Invalid ${paramName} parameter`));
    }
    
    req.params[paramName] = parseInt(id);
    next();
  };
};

/**
 * Validate required fields in request body
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return next(new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`
      ));
    }
    
    next();
  };
};

/**
 * Validate doctor data
 */
const validateDoctorData = (req, res, next) => {
  const { incarnation_number, actor_id } = req.body;
  
  if (req.method === 'POST' || incarnation_number !== undefined) {
    if (!incarnation_number || isNaN(incarnation_number) || incarnation_number <= 0) {
      return next(new ValidationError('Valid incarnation_number is required'));
    }
  }
  
  if (req.method === 'POST' || actor_id !== undefined) {
    if (!actor_id || isNaN(actor_id) || actor_id <= 0) {
      return next(new ValidationError('Valid actor_id is required'));
    }
  }
  
  next();
};

/**
 * Validate episode data
 */
const validateEpisodeData = (req, res, next) => {
  const { season_id, title, episode_number } = req.body;
  
  if (req.method === 'POST' || season_id !== undefined) {
    if (!season_id || isNaN(season_id) || season_id <= 0) {
      return next(new ValidationError('Valid season_id is required'));
    }
  }
  
  if (req.method === 'POST' || title !== undefined) {
    if (!title || title.trim().length === 0) {
      return next(new ValidationError('Title is required'));
    }
  }
  
  if (episode_number !== undefined && (isNaN(episode_number) || episode_number <= 0)) {
    return next(new ValidationError('Episode number must be a positive number'));
  }
  
  next();
};

/**
 * Validate enemy threat level
 */
const validateThreatLevel = (req, res, next) => {
  const { threat_level } = req.body;
  
  if (threat_level !== undefined) {
    const level = parseInt(threat_level);
    if (isNaN(level) || level < DB_CONSTRAINTS.THREAT_LEVEL.MIN || level > DB_CONSTRAINTS.THREAT_LEVEL.MAX) {
      return next(new ValidationError(
        `Threat level must be between ${DB_CONSTRAINTS.THREAT_LEVEL.MIN} and ${DB_CONSTRAINTS.THREAT_LEVEL.MAX}`
      ));
    }
    req.body.threat_level = level;
  }
  
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return next(new BadRequestError('Limit must be a positive number'));
    }
    req.query.limit = limitNum;
  }
  
  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return next(new BadRequestError('Offset must be a non-negative number'));
    }
    req.query.offset = offsetNum;
  }
  
  next();
};

module.exports = {
  validateId,
  validateRequiredFields,
  validateDoctorData,
  validateEpisodeData,
  validateThreatLevel,
  validatePagination
};
/**
 * Application-wide constants and configuration values
 */

module.exports = {
  // Server Configuration
  DEFAULT_PORT: 3000,
  API_VERSION: '1.0.0',
  
  // Database Configuration
  DB_CONSTRAINTS: {
    THREAT_LEVEL: {
      MIN: 1,
      MAX: 10
    }
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    GENERIC: 'An unexpected error occurred',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    INVALID_ID: 'Invalid ID parameter',
    REQUIRED_FIELDS: 'Required fields are missing',
    DATABASE_ERROR: 'Database operation failed',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden'
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully'
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0
  },
  
  // API Documentation
  API_INFO: {
    VERSION: '1.0.0',
    TITLE: 'Doctor Who Database API',
    DESCRIPTION: 'RESTful API for managing Doctor Who universe data',
    ENDPOINTS: {
      doctors: '/api/doctors',
      episodes: '/api/episodes',
      queries: {
        join: '/api/queries/join/doctor/:id or /api/queries/join/episode/:id',
        view: '/api/queries/view/doctor-summary or /api/queries/view/enemy-summary',
        procedure: '/api/queries/procedure/enemies/:threatLevel or /api/queries/procedure/doctor/:incarnation',
        update: '/api/queries/update/enemy/:id/threat-level'
      },
      llm: '/api/llm/query'
    }
  }
};
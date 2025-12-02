/**
 * Base service class providing common CRUD operations
 * Eliminates duplicate code across all service classes
 */

const { NotFoundError, DatabaseError } = require('../utils/errors');

class BaseService {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Get all records with optional filtering and includes
   */
  async getAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw new DatabaseError(`Failed to fetch ${this.modelName} records`);
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, options);
      if (!record) {
        throw new NotFoundError(this.modelName);
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch ${this.modelName}`);
    }
  }

  /**
   * Create a new record
   */
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') throw error;
      throw new DatabaseError(`Failed to create ${this.modelName}`);
    }
  }

  /**
   * Update a record by ID
   */
  async update(id, data) {
    try {
      const record = await this.getById(id);
      return await record.update(data);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      if (error.name === 'SequelizeValidationError') throw error;
      throw new DatabaseError(`Failed to update ${this.modelName}`);
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    try {
      const record = await this.getById(id);
      await record.destroy();
      return { message: `${this.modelName} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      throw new DatabaseError(`Failed to count ${this.modelName} records`);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where) {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check ${this.modelName} existence`);
    }
  }
}

module.exports = BaseService;
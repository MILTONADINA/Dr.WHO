/**
 * Service for Doctor-related operations
 * Extends BaseService to inherit common CRUD operations
 */

const BaseService = require('./BaseService');
const { Doctor, Actor, Episode } = require('../models');

class DoctorService extends BaseService {
  constructor() {
    super(Doctor, 'Doctor');
    this.defaultIncludes = [
      { model: Actor, as: 'actor' },
      { model: Episode, as: 'firstEpisode' },
      { model: Episode, as: 'lastEpisode' }
    ];
  }

  /**
   * Get all doctors with related data
   */
  async getAllDoctors() {
    return this.getAll({ include: this.defaultIncludes });
  }

  /**
   * Get a doctor by ID with related data
   */
  async getDoctorById(id) {
    return this.getById(id, { include: this.defaultIncludes });
  }

  /**
   * Alias methods for consistency with existing code
   */
  async createDoctor(data) {
    return this.create(data);
  }

  async updateDoctor(id, data) {
    return this.update(id, data);
  }

  async deleteDoctor(id) {
    return this.delete(id);
  }
}

module.exports = new DoctorService();


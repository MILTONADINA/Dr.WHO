/**
 * Service for Episode-related operations
 * Extends BaseService to inherit common CRUD operations
 */

const BaseService = require('./BaseService');
const { Episode, Season, Writer, Director } = require('../models');

class EpisodeService extends BaseService {
  constructor() {
    super(Episode, 'Episode');
    this.defaultIncludes = [
      { model: Season, as: 'season' },
      { model: Writer, as: 'writer' },
      { model: Director, as: 'director' }
    ];
  }

  /**
   * Get all episodes with related data, ordered by air date (episodes with dates first, then by episode_id)
   */
  async getAllEpisodes() {
    const { Sequelize } = require('sequelize');
    return this.getAll({
      include: this.defaultIncludes,
      order: [
        [Sequelize.literal('CASE WHEN air_date IS NULL THEN 1 ELSE 0 END'), 'ASC'],
        ['air_date', 'ASC'],
        ['episode_id', 'ASC']
      ]
    });
  }

  /**
   * Get an episode by ID with related data
   */
  async getEpisodeById(id) {
    return this.getById(id, { include: this.defaultIncludes });
  }

  /**
   * Alias methods for consistency with existing code
   */
  async createEpisode(data) {
    return this.create(data);
  }

  async updateEpisode(id, data) {
    return this.update(id, data);
  }

  async deleteEpisode(id) {
    return this.delete(id);
  }
}

module.exports = new EpisodeService();

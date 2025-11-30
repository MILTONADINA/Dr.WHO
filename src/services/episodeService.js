const { Episode, Season, Writer, Director } = require('../models');

class EpisodeService {
  async createEpisode(data) {
    return await Episode.create(data);
  }

  async getAllEpisodes() {
    return await Episode.findAll({
      include: [
        { model: Season, as: 'season' },
        { model: Writer, as: 'writer' },
        { model: Director, as: 'director' }
      ],
      order: [['air_date', 'ASC']]
    });
  }

  async getEpisodeById(id) {
    return await Episode.findByPk(id, {
      include: [
        { model: Season, as: 'season' },
        { model: Writer, as: 'writer' },
        { model: Director, as: 'director' }
      ]
    });
  }

  async updateEpisode(id, data) {
    const episode = await Episode.findByPk(id);
    if (!episode) {
      throw new Error('Episode not found');
    }
    return await episode.update(data);
  }

  async deleteEpisode(id) {
    const episode = await Episode.findByPk(id);
    if (!episode) {
      throw new Error('Episode not found');
    }
    return await episode.destroy();
  }
}

module.exports = new EpisodeService();


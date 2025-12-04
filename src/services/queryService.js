const sequelize = require('../db/sequelize');
const models = require('../models');
const { Doctor, Episode, Companion, Enemy, Planet, EnemyEpisode, EpisodeLocation, DoctorCompanion } = models;

class QueryService {
  // Multi-join query: Get Doctor with all related data
  async getDoctorFullDetails(doctorId) {
    try {
      // First, get the doctor with basic info
      const doctor = await Doctor.findByPk(doctorId, {
        include: [
          { model: models.Actor, as: 'actor' },
          { model: Episode, as: 'firstEpisode' },
          { model: Episode, as: 'lastEpisode' }
        ]
      });

      if (!doctor) return null;

      // Get companions for this doctor
      const companionQueryResult = await sequelize.query(`
        SELECT DISTINCT
          c.companion_id,
          c.name AS companion_name,
          c.species_id,
          s.name AS species_name,
          p.planet_id AS companion_planet_id,
          p.name AS companion_planet_name,
          dc.start_episode_id,
          dc.end_episode_id
        FROM DOCTOR_COMPANIONS dc
        INNER JOIN COMPANIONS c ON dc.companion_id = c.companion_id
        LEFT JOIN SPECIES s ON c.species_id = s.species_id
        LEFT JOIN PLANETS p ON c.home_planet_id = p.planet_id
        WHERE dc.doctor_id = :doctorId
      `, {
        replacements: { doctorId },
        type: sequelize.QueryTypes.SELECT
      });
      // With QueryTypes.SELECT, Sequelize returns the array directly
      const companionRows = Array.isArray(companionQueryResult) ? companionQueryResult : [];

      // Get episodes associated with this doctor through companions
      const episodeQueryResult = await sequelize.query(`
        SELECT DISTINCT
          e.episode_id,
          e.title AS episode_title,
          e.air_date,
          e.runtime_minutes
        FROM DOCTOR_COMPANIONS dc
        INNER JOIN EPISODES e ON (e.episode_id = dc.start_episode_id OR e.episode_id = dc.end_episode_id)
        WHERE dc.doctor_id = :doctorId
      `, {
        replacements: { doctorId },
        type: sequelize.QueryTypes.SELECT
      });
      // With QueryTypes.SELECT, Sequelize returns the array directly
      const episodeRows = Array.isArray(episodeQueryResult) ? episodeQueryResult : [];

      // Get enemies for each episode
      const episodeIds = episodeRows && episodeRows.length > 0 ? episodeRows.map(r => r.episode_id) : [];
      let episodeEnemies = [];
      let episodePlanets = [];

      if (episodeIds.length > 0) {
        const enemyQueryResult = await sequelize.query(`
          SELECT
            ee.episode_id,
            en.enemy_id,
            en.name AS enemy_name,
            en.threat_level
          FROM ENEMY_EPISODES ee
          INNER JOIN ENEMIES en ON ee.enemy_id = en.enemy_id
          WHERE ee.episode_id IN (${episodeIds.join(',')})
        `, {
          type: sequelize.QueryTypes.SELECT
        });
        episodeEnemies = Array.isArray(enemyQueryResult) ? enemyQueryResult : [];

        const planetQueryResult = await sequelize.query(`
          SELECT
            el.episode_id,
            p.planet_id,
            p.name AS planet_name
          FROM EPISODE_LOCATIONS el
          INNER JOIN PLANETS p ON el.planet_id = p.planet_id
          WHERE el.episode_id IN (${episodeIds.join(',')})
        `, {
          type: sequelize.QueryTypes.SELECT
        });
        episodePlanets = Array.isArray(planetQueryResult) ? planetQueryResult : [];
      }

      // Build the result structure
      const result = doctor.toJSON();

      // Add companions
      result.companions = (companionRows || []).map(c => ({
        companion_id: c.companion_id,
        name: c.companion_name,
        start_episode_id: c.start_episode_id,
        end_episode_id: c.end_episode_id,
        species: c.species_id ? {
          species_id: c.species_id,
          name: c.species_name
        } : null,
        homePlanet: c.companion_planet_id ? {
          planet_id: c.companion_planet_id,
          name: c.companion_planet_name
        } : null
      }));

      // Add episodes with enemies and planets
      result.episodes = (episodeRows || []).map(e => {
        const episode = {
          episode_id: e.episode_id,
          title: e.episode_title,
          air_date: e.air_date,
          runtime_minutes: e.runtime_minutes,
          enemies: [],
          planets: []
        };

        // Add enemies
        episodeEnemies
          .filter(en => en.episode_id === e.episode_id)
          .forEach(en => {
            episode.enemies.push({
              enemy_id: en.enemy_id,
              name: en.enemy_name,
              threat_level: en.threat_level
            });
          });

        // Add planets
        episodePlanets
          .filter(pl => pl.episode_id === e.episode_id)
          .forEach(pl => {
            episode.planets.push({
              planet_id: pl.planet_id,
              name: pl.planet_name
            });
          });

        return episode;
      });

      return result;
    } catch (error) {
      console.error('Error in getDoctorFullDetails:', error);
      throw error;
    }
  }

  // Alternative multi-join query: Get episodes with all related entities
  async getEpisodeWithAllDetails(episodeId) {
    const episode = await Episode.findByPk(episodeId, {
      include: [
        { model: models.Season, as: 'season' },
        { model: models.Writer, as: 'writer' },
        { model: models.Director, as: 'director' },
        {
          model: Enemy,
          as: 'enemies',
          through: { attributes: ['role'] },
          required: false,
          include: [
            { model: Planet, as: 'homePlanet' },
            { model: models.Species, as: 'species' }
          ]
        },
        {
          model: Planet,
          as: 'planets',
          through: { attributes: ['visit_order'] },
          required: false
        }
      ]
    });

    if (!episode) return null;

    // Get doctors associated with this episode through companions
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Companion,
          as: 'companions',
          through: {
            where: {
              $or: [
                { start_episode_id: episodeId },
                { end_episode_id: episodeId }
              ]
            }
          },
          required: false
        },
        { model: models.Actor, as: 'actor' }
      ],
      distinct: true
    });

    // Convert to plain object and add doctors
    const result = episode.toJSON();
    result.doctors = doctors.map(d => d.toJSON());

    return result;
  }

  // Query VIEW
  async queryDoctorEpisodeSummary() {
    try {
    const [results] = await sequelize.query('SELECT * FROM doctor_episode_summary');
    return results;
    } catch (error) {
      if (error.message && error.message.includes("doesn't exist")) {
        throw new Error('VIEW "doctor_episode_summary" does not exist. Please run: npm run db:objects');
      }
      throw error;
    }
  }

  async queryEnemyAppearanceSummary() {
    try {
    const [results] = await sequelize.query('SELECT * FROM enemy_appearance_summary');
    return results;
    } catch (error) {
      if (error.message && error.message.includes("doesn't exist")) {
        throw new Error('VIEW "enemy_appearance_summary" does not exist. Please run: npm run db:objects');
      }
      throw error;
    }
  }

  // Call STORED PROCEDURE
  async getEnemiesByThreatLevel(minThreatLevel) {
    try {
    const results = await sequelize.query(
      'CALL GetEnemiesByThreatLevel(:minThreatLevel)',
      {
        replacements: { minThreatLevel },
        type: sequelize.QueryTypes.RAW
      }
    );
    // MySQL stored procedures return results in a nested array
      // Results structure: [[rows], metadata]
      if (Array.isArray(results) && results.length > 0) {
        return Array.isArray(results[0]) ? results[0] : results;
      }
      return [];
    } catch (error) {
      if (error.message && (error.message.includes("doesn't exist") || error.message.includes("Unknown procedure"))) {
        throw new Error('STORED PROCEDURE "GetEnemiesByThreatLevel" does not exist. Please run: npm run db:objects');
      }
      throw error;
    }
  }

  async getEpisodesForDoctor(incarnationNumber) {
    const results = await sequelize.query(
      'CALL GetEpisodesForDoctor(:incarnationNumber)',
      {
        replacements: { incarnationNumber },
        type: sequelize.QueryTypes.RAW
      }
    );
    return results[0] || [];
  }

  // UPDATE query
  async updateEnemyThreatLevel(enemyId, newThreatLevel) {
    try {
      // First update the threat level
      await sequelize.query(
        'UPDATE ENEMIES SET threat_level = :newThreatLevel WHERE enemy_id = :enemyId',
        {
          replacements: { enemyId, newThreatLevel },
          type: sequelize.QueryTypes.UPDATE
        }
      );

      // Then return the updated record
      const results = await sequelize.query(
        `SELECT e.enemy_id, e.name, e.threat_level, s.name AS species_name, p.name AS home_planet
         FROM ENEMIES e
         LEFT JOIN SPECIES s ON e.species_id = s.species_id
         LEFT JOIN PLANETS p ON e.home_planet_id = p.planet_id
         WHERE e.enemy_id = :enemyId`,
        {
          replacements: { enemyId },
          type: sequelize.QueryTypes.SELECT
        }
      );
      // QueryTypes.SELECT returns [results, metadata], results is an array of rows
      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new QueryService();


const express = require('express');
const router = express.Router();
const queryService = require('../services/queryService');

// Get doctor with all related data
router.get('/join/doctor/:id', async (req, res) => {
  try {
    const doctor = await queryService.getDoctorFullDetails(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error in getDoctorFullDetails:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get episode with all related data
router.get('/join/episode/:id', async (req, res) => {
  try {
    const episode = await queryService.getEpisodeWithAllDetails(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    res.json(episode);
  } catch (error) {
    console.error('Error in getEpisodeWithAllDetails:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Query doctor summary view
router.get('/view/doctor-summary', async (req, res) => {
  try {
    const results = await queryService.queryDoctorEpisodeSummary();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Query enemy summary view
router.get('/view/enemy-summary', async (req, res) => {
  try {
    const results = await queryService.queryEnemyAppearanceSummary();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enemies by threat level (stored procedure)
router.get('/procedure/enemies/:threatLevel', async (req, res) => {
  try {
    const threatLevel = parseInt(req.params.threatLevel);
    if (isNaN(threatLevel) || threatLevel < 1 || threatLevel > 10) {
      return res.status(400).json({ error: 'Threat level must be between 1 and 10' });
    }
    const results = await queryService.getEnemiesByThreatLevel(threatLevel);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get episodes for doctor (stored procedure)
router.get('/procedure/doctor/:incarnation', async (req, res) => {
  try {
    const incarnation = parseInt(req.params.incarnation);
    if (isNaN(incarnation)) {
      return res.status(400).json({ error: 'Invalid incarnation number' });
    }
    const results = await queryService.getEpisodesForDoctor(incarnation);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enemy threat level
router.put('/update/enemy/:id/threat-level', async (req, res) => {
  try {
    const enemyId = parseInt(req.params.id);
    const { threat_level } = req.body;

    if (isNaN(enemyId)) {
      return res.status(400).json({ error: 'Invalid enemy ID' });
    }
    if (!threat_level || threat_level < 1 || threat_level > 10) {
      return res.status(400).json({ error: 'Threat level must be between 1 and 10' });
    }

    const result = await queryService.updateEnemyThreatLevel(enemyId, threat_level);
    if (!result) {
      return res.status(404).json({ error: 'Enemy not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


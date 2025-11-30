const express = require('express');
const router = express.Router();
const episodeService = require('../services/episodeService');

// Get all episodes
router.get('/', async (req, res) => {
  try {
    const episodes = await episodeService.getAllEpisodes();
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single episode
router.get('/:id', async (req, res) => {
  try {
    const episode = await episodeService.getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    res.json(episode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create episode
router.post('/', async (req, res) => {
  try {
    const episode = await episodeService.createEpisode(req.body);
    res.status(201).json(episode);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update episode
router.put('/:id', async (req, res) => {
  try {
    const episode = await episodeService.updateEpisode(req.params.id, req.body);
    res.json(episode);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete episode
router.delete('/:id', async (req, res) => {
  try {
    await episodeService.deleteEpisode(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;


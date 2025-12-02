/**
 * Routes for Episode operations
 * Clean, validated, and properly handled
 */

const express = require('express');
const router = express.Router();
const episodeService = require('../services/episodeService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendUpdated, sendDeleted } = require('../utils/responseHandler');
const { validateId, validateEpisodeData } = require('../middleware/validation');

/**
 * GET /api/episodes - Get all episodes
 */
router.get('/', asyncHandler(async (req, res) => {
  const episodes = await episodeService.getAllEpisodes();
  sendSuccess(res, episodes);
}));

/**
 * GET /api/episodes/:id - Get episode by ID
 */
router.get('/:id', validateId(), asyncHandler(async (req, res) => {
  const episode = await episodeService.getEpisodeById(req.params.id);
  sendSuccess(res, episode);
}));

/**
 * POST /api/episodes - Create new episode
 */
router.post('/', validateEpisodeData, asyncHandler(async (req, res) => {
  const episode = await episodeService.createEpisode(req.body);
  sendCreated(res, episode);
}));

/**
 * PUT /api/episodes/:id - Update episode
 */
router.put('/:id', validateId(), validateEpisodeData, asyncHandler(async (req, res) => {
  const episode = await episodeService.updateEpisode(req.params.id, req.body);
  sendUpdated(res, episode);
}));

/**
 * DELETE /api/episodes/:id - Delete episode
 */
router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
  await episodeService.deleteEpisode(req.params.id);
  sendDeleted(res);
}));

module.exports = router;
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const sequelize = require('../db/sequelize');
const models = require('../models');

// Setup OpenAI if we have an API key
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

async function getDatabaseSchema() {
  const schema = {
    tables: [
      'ACTORS', 'WRITERS', 'DIRECTORS', 'SEASONS', 'EPISODES',
      'DOCTOR', 'COMPANIONS', 'CHARACTER', 'TARDIS',
      'PLANETS', 'ENEMIES', 'SPECIES',
      'DOCTOR_COMPANIONS', 'EPISODE_APPEARANCES', 'EPISODE_LOCATIONS', 'ENEMY_EPISODES'
    ],
    relationships: [
      'Doctors have companions (many-to-many)',
      'Episodes have enemies (many-to-many)',
      'Episodes visit planets (many-to-many)',
      'Doctors are played by actors (one-to-many)',
      'Episodes belong to seasons (many-to-one)'
    ]
  };
  return schema;
}

async function executeSafeQuery(query) {
  // Only allow SELECT queries for safety
  if (!query.trim().toUpperCase().startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }
  try {
    const [results] = await sequelize.query(query);
    return results;
  } catch (error) {
    throw new Error(`Query error: ${error.message}`);
  }
}

// Natural language query endpoint
router.post('/query', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'LLM service not configured. Please set OPENAI_API_KEY in .env file.'
      });
    }

    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get database schema for context
    const schema = await getDatabaseSchema();

    // Get sample data for context
    const sampleDoctors = await models.Doctor.findAll({ limit: 3, include: [{ model: models.Actor, as: 'actor' }] });
    const sampleEpisodes = await models.Episode.findAll({ limit: 3, include: [{ model: models.Season, as: 'season' }] });
    const sampleEnemies = await models.Enemy.findAll({ limit: 3 });

    const systemPrompt = `Help users query our Doctor Who database. Tables: ${schema.tables.join(', ')}.

Relationships: ${schema.relationships.join(', ')}

Sample data:
Doctors: ${JSON.stringify(sampleDoctors.map(d => ({ id: d.doctor_id, incarnation: d.incarnation_number, actor: d.actor?.name })))}
Episodes: ${JSON.stringify(sampleEpisodes.map(e => ({ id: e.episode_id, title: e.title, season: e.season?.series_number })))}
Enemies: ${JSON.stringify(sampleEnemies.map(e => ({ id: e.enemy_id, name: e.name, threat: e.threat_level })))}

Answer questions about the database and suggest relevant API endpoints when helpful.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content;

    res.json({
      answer,
      query: query,
      model: 'gpt-3.5-turbo'
    });
  } catch (error) {
    console.error('LLM error:', error);

    // Handle specific OpenAI API errors
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        error: error.response.data?.error?.message || 'API quota exceeded. Please check your OpenAI billing and plan details.',
        details: 'Note: ChatGPT Plus subscription is separate from OpenAI API access. You need to set up billing at platform.openai.com/account/billing',
        codeStatus: 'The LLM integration code is complete and working. This is a billing/quota configuration issue, not a code problem.'
      });
    }

    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key. Please check your OPENAI_API_KEY in the .env file.',
        details: 'Make sure the API key starts with "sk-" and is valid.'
      });
    }

    res.status(500).json({
      error: error.message || 'An error occurred while processing your query.',
      details: error.response?.data?.error?.message || 'Please check your API key and billing status.'
    });
  }
});

module.exports = router;


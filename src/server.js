const express = require('express');
const cors = require('cors');
const sequelize = require('./db/sequelize');
require('dotenv').config();

const doctorsRouter = require('./routes/doctors');
const episodesRouter = require('./routes/episodes');
const queriesRouter = require('./routes/queries');
const llmRouter = require('./routes/llm');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Doctor Who Database API',
    version: '1.0.0',
    endpoints: {
      doctors: '/api/doctors',
      episodes: '/api/episodes',
      queries: {
        join: '/api/queries/join/doctor/:id or /api/queries/join/episode/:id',
        view: '/api/queries/view/doctor-summary or /api/queries/view/enemy-summary',
        procedure: '/api/queries/procedure/enemies/:threatLevel or /api/queries/procedure/doctor/:incarnation',
        update: '/api/queries/update/enemy/:id/threat-level'
      }
    }
  });
});

app.use('/api/doctors', doctorsRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/llm', llmRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('[OK] Database connection established.');

    app.listen(PORT, () => {
      console.log(`[OK] Server running on http://localhost:${PORT}`);
      console.log(`[OK] API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;


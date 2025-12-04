const express = require('express');
const cors = require('cors');
const sequelize = require('./db/sequelize');
require('dotenv').config();

const doctorsRouter = require('./routes/doctors');
const episodesRouter = require('./routes/episodes');
const queriesRouter = require('./routes/queries');
const llmRouter = require('./routes/llm');
const path = require('path');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { DEFAULT_PORT, API_INFO } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Documentation endpoint
app.get('/', (req, res) => {
  res.json({
    message: API_INFO.TITLE,
    version: API_INFO.VERSION,
    description: API_INFO.DESCRIPTION,
    endpoints: API_INFO.ENDPOINTS
  });
});

app.use('/api/doctors', doctorsRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/llm', llmRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

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

// Export for Vercel
module.exports = app;

// Only start server locally (not on Vercel)
if (require.main === module) {
  startServer();
}


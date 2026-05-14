const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./config/schema');
const CronJobsService = require('./cron/jobs');

// Import routes
const playersRoutes = require('./routes/players');
const newsRoutes = require('./routes/news');
const leaguesRoutes = require('./routes/leagues');
const teamsRoutes = require('./routes/teams');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/players', playersRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/sync', syncRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'LoL Pro Stats API',
    version: '1.0.0',
    description: 'API for professional League of Legends player statistics and news',
    endpoints: {
      players: '/api/players',
      news: '/api/news',
      leagues: '/api/leagues',
      teams: '/api/teams',
      sync: '/api/sync',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Initialize cron jobs
    CronJobsService.initializeAll();
    
    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Server running on port ' + PORT);
      console.log('📡 API available at http://localhost:' + PORT);
      console.log('💚 Health check at http://localhost:' + PORT + '/health');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

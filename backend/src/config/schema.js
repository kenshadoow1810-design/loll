const pool = require('../config/database');

const createTables = async () => {
  const createTeamsTable = `
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      league VARCHAR(50) NOT NULL,
      games_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, league)
    );
  `;

  const createPlayersTable = `
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      team_name VARCHAR(255),
      position VARCHAR(10),
      league VARCHAR(50) NOT NULL,
      games_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      kda DECIMAL(5, 2),
      kill_participation DECIMAL(5, 2),
      gold_per_10 DECIMAL(8, 2),
      dpm DECIMAL(8, 2),
      cspm DECIMAL(8, 2),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, league)
    );
  `;

  const createChampionStatsTable = `
    CREATE TABLE IF NOT EXISTS champion_stats (
      id SERIAL PRIMARY KEY,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      games_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      bans INTEGER DEFAULT 0,
      total_kills INTEGER DEFAULT 0,
      total_deaths INTEGER DEFAULT 0,
      total_assists INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_name, role)
    );
  `;

  try {
    await pool.query(createTeamsTable);
    console.log('Teams table created successfully');
    
    await pool.query(createPlayersTable);
    console.log('Players table created successfully');
    
    await pool.query(createChampionStatsTable);
    console.log('Champion stats table created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };

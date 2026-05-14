const pool = require('../config/database');

/**
 * Create players table
 */
const createPlayersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      puuid VARCHAR(78) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      team_id INTEGER REFERENCES teams(id),
      rank VARCHAR(50),
      tier VARCHAR(20),
      league_points INTEGER,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      profile_icon_id INTEGER,
      summoner_level INTEGER,
      region VARCHAR(20) DEFAULT 'br1',
      last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Players table created successfully');
  } catch (error) {
    console.error('❌ Error creating players table:', error);
    throw error;
  }
};

/**
 * Create teams table
 */
const createTeamsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      logo_url VARCHAR(500),
      region VARCHAR(20),
      league VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Teams table created successfully');
  } catch (error) {
    console.error('❌ Error creating teams table:', error);
    throw error;
  }
};

/**
 * Create matches table
 */
const createMatchesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      match_id VARCHAR(100) UNIQUE NOT NULL,
      player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
      champion VARCHAR(100),
      role VARCHAR(20),
      lane VARCHAR(20),
      kills INTEGER DEFAULT 0,
      deaths INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      cs INTEGER DEFAULT 0,
      gold_earned INTEGER DEFAULT 0,
      damage_dealt INTEGER DEFAULT 0,
      damage_taken INTEGER DEFAULT 0,
      vision_score INTEGER DEFAULT 0,
      win BOOLEAN,
      game_duration INTEGER,
      game_mode VARCHAR(50),
      game_type VARCHAR(50),
      queue_id INTEGER,
      spell1_id INTEGER,
      spell2_id INTEGER,
      item0 INTEGER,
      item1 INTEGER,
      item2 INTEGER,
      item3 INTEGER,
      item4 INTEGER,
      item5 INTEGER,
      item6 INTEGER,
      kda DECIMAL(5,2),
      date TIMESTAMP,
      region VARCHAR(20) DEFAULT 'br1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Matches table created successfully');
  } catch (error) {
    console.error('❌ Error creating matches table:', error);
    throw error;
  }
};

/**
 * Create news table
 */
const createNewsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      url VARCHAR(1000) NOT NULL UNIQUE,
      source VARCHAR(100),
      published_at TIMESTAMP,
      summary TEXT,
      image_url VARCHAR(1000),
      category VARCHAR(100),
      region VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ News table created successfully');
  } catch (error) {
    console.error('❌ Error creating news table:', error);
    throw error;
  }
};

/**
 * Create leagues table for rankings
 */
const createLeaguesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS leagues (
      id SERIAL PRIMARY KEY,
      league_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100),
      tier VARCHAR(20),
      queue VARCHAR(50),
      region VARCHAR(20),
      entries JSONB,
      last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Leagues table created successfully');
  } catch (error) {
    console.error('❌ Error creating leagues table:', error);
    throw error;
  }
};

/**
 * Create indexes for better performance
 */
const createIndexes = async () => {
  const queries = [
    'CREATE INDEX IF NOT EXISTS idx_players_puuid ON players(puuid)',
    'CREATE INDEX IF NOT EXISTS idx_players_name ON players(name)',
    'CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_matches_player ON matches(player_id)',
    'CREATE INDEX IF NOT EXISTS idx_matches_match_id ON matches(match_id)',
    'CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date)',
    'CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_leagues_region ON leagues(region)'
  ];
  
  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

/**
 * Initialize database - create all tables and indexes
 */
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    await createTeamsTable();
    await createPlayersTable();
    await createMatchesTable();
    await createNewsTable();
    await createLeaguesTable();
    await createIndexes();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  createPlayersTable,
  createTeamsTable,
  createMatchesTable,
  createNewsTable,
  createLeaguesTable,
  createIndexes,
  pool
};

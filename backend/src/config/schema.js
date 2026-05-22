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
      logo_url VARCHAR(500),
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
      win_percentage DECIMAL(5, 2) DEFAULT 0,
      kda DECIMAL(5, 2),
      kill_participation DECIMAL(5, 2),
      gold_per_min DECIMAL(8, 2),
      dpm DECIMAL(8, 2),
      cspm DECIMAL(8, 2),
      real_name VARCHAR(255),
      image_url VARCHAR(500),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, league)
    );
  `;

  const createChampionStatsTable = `
    CREATE TABLE IF NOT EXISTS champion_stats (
      id SERIAL PRIMARY KEY,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      league VARCHAR(50) NOT NULL,
      games_played INTEGER DEFAULT 0,
      win_percentage DECIMAL(5, 2) DEFAULT 0,
      ban_percentage DECIMAL(5, 2) DEFAULT 0,
      total_kills INTEGER DEFAULT 0,
      total_deaths INTEGER DEFAULT 0,
      total_assists INTEGER DEFAULT 0,
      icon_url VARCHAR(500),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_name, role, league)
    );
  `;

  const createMatchesTable = `
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      match_id_api INTEGER UNIQUE NOT NULL,
      name VARCHAR(255),
      scheduled_at TIMESTAMP NOT NULL,
      status VARCHAR(50) DEFAULT 'not_started',
      number_of_games INTEGER DEFAULT 1,
      league_id INTEGER,
      league_name VARCHAR(255),
      league_slug VARCHAR(255),
      league_image_url VARCHAR(500),
      tournament_id INTEGER,
      tournament_name VARCHAR(255),
      team1_id INTEGER,
      team1_name VARCHAR(255),
      team1_acronym VARCHAR(50),
      team1_logo_url VARCHAR(500),
      team1_dark_logo_url VARCHAR(500),
      team2_id INTEGER,
      team2_name VARCHAR(255),
      team2_acronym VARCHAR(50),
      team2_logo_url VARCHAR(500),
      team2_dark_logo_url VARCHAR(500),
      stream_url VARCHAR(500),
      slug VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserPreferencesTable = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      favorite_teams TEXT[], -- Array de IDs ou nomes de times
      favorite_leagues TEXT[], -- Array de IDs ou nomes de ligas
      notify_before_match BOOLEAN DEFAULT true,
      notify_minutes_before INTEGER DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPushSubscriptionsTable = `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(500) NOT NULL UNIQUE,
      p256dh VARCHAR(255) NOT NULL,
      auth VARCHAR(255) NOT NULL,
      favorite_teams TEXT[] DEFAULT '{}',
      favorite_leagues TEXT[] DEFAULT '{}',
      expiration_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES matches(id),
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      icon VARCHAR(500),
      badge VARCHAR(500),
      data JSONB,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending' -- pending, sent, failed
    );
  `;

  try {
    await pool.query(createTeamsTable);
    console.log('Teams table created successfully');
    
    await pool.query(createPlayersTable);
    console.log('Players table created successfully');
    
    await pool.query(createChampionStatsTable);
    console.log('Champion stats table created successfully');
    
    await pool.query(createMatchesTable);
    console.log('Matches table created successfully');
    
    await pool.query(createUserPreferencesTable);
    console.log('User preferences table created successfully');
    
    await pool.query(createPushSubscriptionsTable);
    console.log('Push subscriptions table created successfully');
    
    await pool.query(createNotificationsTable);
    console.log('Notifications table created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };

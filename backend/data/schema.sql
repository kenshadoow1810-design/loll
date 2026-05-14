-- Schema do Banco de Dados ProStats LoL

-- Tabela de Times
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    region VARCHAR(50) NOT NULL,
    league VARCHAR(50),
    founded_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Jogadores
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    puuid VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    role VARCHAR(20),
    rank VARCHAR(50),
    profile_icon_id INTEGER,
    country VARCHAR(50),
    real_name VARCHAR(100),
    birth_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Partidas (Matches)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL UNIQUE,
    game_mode VARCHAR(50),
    game_type VARCHAR(50),
    map_id INTEGER,
    season INTEGER,
    queue_id INTEGER,
    game_duration INTEGER,
    game_creation BIGINT,
    game_end_timestamp BIGINT,
    winner BOOLEAN,
    first_blood BOOLEAN,
    first_tower BOOLEAN,
    first_inhibitor BOOLEAN,
    first_baron BOOLEAN,
    first_dragon BOOLEAN,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    total_damage_dealt INTEGER,
    total_damage_taken INTEGER,
    gold_earned INTEGER,
    champ_level INTEGER,
    total_minions_killed INTEGER,
    neutral_minions_killed INTEGER,
    vision_score INTEGER,
    wards_placed INTEGER,
    wards_killed INTEGER,
    item0 INTEGER,
    item1 INTEGER,
    item2 INTEGER,
    item3 INTEGER,
    item4 INTEGER,
    item5 INTEGER,
    item6 INTEGER,
    perk0 INTEGER,
    perk1 INTEGER,
    perk2 INTEGER,
    perk3 INTEGER,
    perk4 INTEGER,
    perk5 INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Relacionamento Player-Match (para múltiplos jogadores por partida)
CREATE TABLE IF NOT EXISTS player_matches (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    champion_id INTEGER,
    champion_name VARCHAR(50),
    role VARCHAR(20),
    lane VARCHAR(20),
    team_position VARCHAR(20),
    win BOOLEAN,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    kda DECIMAL(5,2),
    cs INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    vision_score INTEGER DEFAULT 0,
    items INTEGER[],
    perks INTEGER[],
    game_duration INTEGER,
    played_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, match_id)
);

-- Tabela de Calendário/Schedule (partidas futuras competitivas)
CREATE TABLE IF NOT EXISTS schedule (
    id SERIAL PRIMARY KEY,
    match_code VARCHAR(100) UNIQUE,
    league VARCHAR(50) NOT NULL,
    stage VARCHAR(50),
    week INTEGER,
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id),
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    stream_url VARCHAR(255),
    best_of INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notícias
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    url VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    author VARCHAR(100),
    image_url VARCHAR(255),
    published_at TIMESTAMP NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Estatísticas Agregadas de Jogadores
CREATE TABLE IF NOT EXISTS player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    season INTEGER,
    split VARCHAR(20),
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    total_kills INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    total_assists INTEGER DEFAULT 0,
    kda DECIMAL(5,2),
    avg_kills DECIMAL(5,2),
    avg_deaths DECIMAL(5,2),
    avg_assists DECIMAL(5,2),
    total_cs INTEGER DEFAULT 0,
    avg_cs DECIMAL(7,2),
    total_gold INTEGER DEFAULT 0,
    avg_gold DECIMAL(10,2),
    total_damage_dealt INTEGER DEFAULT 0,
    avg_damage_dealt DECIMAL(10,2),
    total_vision_score INTEGER DEFAULT 0,
    avg_vision_score DECIMAL(7,2),
    most_played_champions INTEGER[],
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, season, split)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_puuid ON players(puuid);
CREATE INDEX IF NOT EXISTS idx_player_matches_player ON player_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_match ON player_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_champion ON player_matches(champion_name);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_schedule_league ON schedule(league);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

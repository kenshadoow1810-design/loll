import pool from '../config/database.js';

// Cache em memória simples
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class CacheService {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value, ttl = CACHE_TTL) {
    cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  delete(key) {
    cache.delete(key);
  }

  clear() {
    cache.clear();
  }

  // Limpeza periódica de itens expirados
  startCleanup(interval = 60000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of cache.entries()) {
        if (now > item.expiry) {
          cache.delete(key);
        }
      }
    }, interval);
  }
}

export const cacheService = new CacheService();

// Helper para queries comuns
export const playerQueries = {
  getAll: async (limit = 100) => {
    const cacheKey = 'players:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo, t.league
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.is_active = true
       ORDER BY p.name
       LIMIT $1`,
      [limit]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  },

  getById: async (id) => {
    const cacheKey = `player:${id}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo, t.league, t.region
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length > 0) {
      cacheService.set(cacheKey, result.rows[0]);
      return result.rows[0];
    }
    return null;
  },

  getByName: async (name) => {
    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo, t.league
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.name ILIKE $1 AND p.is_active = true
       LIMIT 20`,
      [`%${name}%`]
    );
    
    return result.rows;
  },

  getByLeague: async (league) => {
    const cacheKey = `players:league:${league}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE t.league = $1 AND p.is_active = true
       ORDER BY p.role, p.name`,
      [league]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  },

  getTopPlayers: async (limit = 10) => {
    const cacheKey = `players:top:${limit}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT p.*, t.name as team_name, t.logo_url as team_logo, t.league,
              COALESCE(ps.kda, 0) as kda,
              COALESCE(ps.win_rate, 0) as win_rate,
              COALESCE(ps.games_played, 0) as games_played
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN player_stats ps ON p.id = ps.player_id
       WHERE p.is_active = true
       ORDER BY ps.kda DESC NULLS LAST, ps.win_rate DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  }
};

export const teamQueries = {
  getAll: async () => {
    const cacheKey = 'teams:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT * FROM teams ORDER BY league, name`
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  },

  getByLeague: async (league) => {
    const cacheKey = `teams:league:${league}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT * FROM teams WHERE league = $1 ORDER BY name`,
      [league]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  }
};

export const scheduleQueries = {
  getUpcoming: async (league = null, limit = 50) => {
    const cacheKey = `schedule:upcoming:${league || 'all'}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    let query = `
      SELECT s.*, 
             t1.name as team1_name, t1.logo_url as team1_logo,
             t2.name as team2_name, t2.logo_url as team2_logo
      FROM schedule s
      LEFT JOIN teams t1 ON s.team1_id = t1.id
      LEFT JOIN teams t2 ON s.team2_id = t2.id
      WHERE s.scheduled_at > NOW() AND s.status = 'scheduled'
    `;
    
    const params = [];
    if (league) {
      query += ` AND s.league = $1`;
      params.push(league);
    }
    
    query += ` ORDER BY s.scheduled_at ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  }
};

export const newsQueries = {
  getLatest: async (limit = 20) => {
    const cacheKey = `news:latest:${limit}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT * FROM news 
       ORDER BY published_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  }
};

export const statsQueries = {
  getMostPlayedChampions: async (limit = 10) => {
    const cacheKey = `stats:champions:${limit}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT champion_name, COUNT(*) as games_played
       FROM player_matches
       WHERE champion_name IS NOT NULL
       GROUP BY champion_name
       ORDER BY games_played DESC
       LIMIT $1`,
      [limit]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  },

  getTopKDA: async (limit = 5, minGames = 10) => {
    const cacheKey = `stats:kda:top:${limit}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT p.name, p.team_name, p.league, 
              AVG(pm.kda) as avg_kda,
              COUNT(pm.id) as games_count
       FROM player_matches pm
       JOIN players p ON pm.player_id = p.id
       WHERE pm.kda IS NOT NULL
       GROUP BY p.id, p.name, p.team_name, p.league
       HAVING COUNT(pm.id) >= $1
       ORDER BY avg_kda DESC
       LIMIT $2`,
      [minGames, limit]
    );
    
    cacheService.set(cacheKey, result.rows);
    return result.rows;
  },

  getPlayerComparison: async (player1Id, player2Id) => {
    const query = `
      SELECT p.id, p.name, p.team_name, p.role, p.league,
             COALESCE(ps.games_played, 0) as games_played,
             COALESCE(ps.win_rate, 0) as win_rate,
             COALESCE(ps.kda, 0) as kda,
             COALESCE(ps.avg_kills, 0) as avg_kills,
             COALESCE(ps.avg_deaths, 0) as avg_deaths,
             COALESCE(ps.avg_assists, 0) as avg_assists,
             COALESCE(ps.avg_cs, 0) as avg_cs,
             COALESCE(ps.avg_gold, 0) as avg_gold,
             COALESCE(ps.avg_damage_dealt, 0) as avg_damage_dealt,
             COALESCE(ps.avg_vision_score, 0) as avg_vision_score
      FROM players p
      LEFT JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.id = ANY($1)
    `;
    
    const result = await pool.query(query, [[player1Id, player2Id]]);
    return result.rows;
  }
};

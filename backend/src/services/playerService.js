const pool = require('../config/database');

/**
 * Player Service - handles all player-related database operations
 */
class PlayerService {
  /**
   * Create or update a player
   */
  static async upsertPlayer(playerData) {
    const {
      puuid,
      name,
      team_id,
      rank,
      tier,
      league_points,
      wins,
      losses,
      profile_icon_id,
      summoner_level,
      region
    } = playerData;

    const query = `
      INSERT INTO players (
        puuid, name, team_id, rank, tier, league_points,
        wins, losses, profile_icon_id, summoner_level, region, last_update
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (puuid) DO UPDATE SET
        name = EXCLUDED.name,
        team_id = EXCLUDED.team_id,
        rank = EXCLUDED.rank,
        tier = EXCLUDED.tier,
        league_points = EXCLUDED.league_points,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        profile_icon_id = EXCLUDED.profile_icon_id,
        summoner_level = EXCLUDED.summoner_level,
        region = EXCLUDED.region,
        last_update = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      puuid, name, team_id || null, rank, tier, league_points,
      wins || 0, losses || 0, profile_icon_id, summoner_level, region || 'br1'
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error upserting player:', error);
      throw error;
    }
  }

  /**
   * Get player by ID
   */
  static async getPlayerById(id) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching player by ID:', error);
      throw error;
    }
  }

  /**
   * Get player by PUUID
   */
  static async getPlayerByPUUID(puuid) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.puuid = $1
    `;

    try {
      const result = await pool.query(query, [puuid]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching player by PUUID:', error);
      throw error;
    }
  }

  /**
   * Get player by name
   */
  static async getPlayerByName(name) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE LOWER(p.name) = LOWER($1)
    `;

    try {
      const result = await pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching player by name:', error);
      throw error;
    }
  }

  /**
   * Search players by name (partial match)
   */
  static async searchPlayers(searchTerm, limit = 20) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE LOWER(p.name) LIKE LOWER($1)
      ORDER BY p.last_update DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  }

  /**
   * Get top players by league points
   */
  static async getTopPlayers(region = null, limit = 50) {
    let query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.tier IN ('CHALLENGER', 'GRANDMASTER', 'MASTER')
    `;
    
    const params = [];
    
    if (region) {
      query += ' AND p.region = $1';
      params.push(region);
    }
    
    query += ' ORDER BY p.league_points DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching top players:', error);
      throw error;
    }
  }

  /**
   * Get players by team
   */
  static async getPlayersByTeam(teamId) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = $1
      ORDER BY p.league_points DESC
    `;

    try {
      const result = await pool.query(query, [teamId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching players by team:', error);
      throw error;
    }
  }

  /**
   * Get players by region
   */
  static async getPlayersByRegion(region, limit = 100) {
    const query = `
      SELECT p.*, t.name as team_name, t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.region = $1
      ORDER BY p.league_points DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [region, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching players by region:', error);
      throw error;
    }
  }

  /**
   * Update player stats from ranked info
   */
  static async updatePlayerStats(puuid, rankedData) {
    const { tier, rank, leaguePoints, wins, losses } = rankedData;

    const query = `
      UPDATE players
      SET tier = $1, rank = $2, league_points = $3,
          wins = $4, losses = $5, last_update = CURRENT_TIMESTAMP
      WHERE puuid = $6
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [tier, rank, leaguePoints, wins, losses, puuid]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw error;
    }
  }

  /**
   * Get player statistics (aggregated)
   */
  static async getPlayerStats(playerId) {
    const query = `
      SELECT 
        COUNT(*) as total_games,
        COUNT(*) FILTER (WHERE win = true) as wins,
        COUNT(*) FILTER (WHERE win = false) as losses,
        ROUND(COUNT(*) FILTER (WHERE win = true)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as winrate,
        ROUND(AVG(kills), 2) as avg_kills,
        ROUND(AVG(deaths), 2) as avg_deaths,
        ROUND(AVG(assists), 2) as avg_assists,
        ROUND(AVG((kills + assists)::DECIMAL / NULLIF(deaths, 0)), 2) as avg_kda,
        ROUND(AVG(cs), 2) as avg_cs,
        ROUND(AVG(vision_score), 2) as avg_vision
      FROM matches
      WHERE player_id = $1
    `;

    try {
      const result = await pool.query(query, [playerId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }

  /**
   * Get most played champions by player
   */
  static async getPlayerChampionStats(playerId, limit = 10) {
    const query = `
      SELECT 
        champion,
        COUNT(*) as games_played,
        COUNT(*) FILTER (WHERE win = true) as wins,
        ROUND(COUNT(*) FILTER (WHERE win = true)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as winrate,
        ROUND(AVG(kills), 2) as avg_kills,
        ROUND(AVG(deaths), 2) as avg_deaths,
        ROUND(AVG(assists), 2) as avg_assists
      FROM matches
      WHERE player_id = $1
      GROUP BY champion
      ORDER BY games_played DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [playerId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching player champion stats:', error);
      throw error;
    }
  }

  /**
   * Delete player by ID
   */
  static async deletePlayer(id) {
    const query = 'DELETE FROM players WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }

  /**
   * Get all players count
   */
  static async getTotalPlayersCount() {
    const query = 'SELECT COUNT(*) as count FROM players';

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting players:', error);
      throw error;
    }
  }
}

module.exports = PlayerService;

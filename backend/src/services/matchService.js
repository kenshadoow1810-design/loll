const pool = require('../config/database');

/**
 * Match Service - handles all match-related database operations
 */
class MatchService {
  /**
   * Create a new match record
   */
  static async createMatch(matchData) {
    const {
      match_id,
      player_id,
      champion,
      role,
      lane,
      kills,
      deaths,
      assists,
      cs,
      gold_earned,
      damage_dealt,
      damage_taken,
      vision_score,
      win,
      game_duration,
      game_mode,
      game_type,
      queue_id,
      spell1_id,
      spell2_id,
      item0,
      item1,
      item2,
      item3,
      item4,
      item5,
      item6,
      kda,
      date,
      region
    } = matchData;

    const query = `
      INSERT INTO matches (
        match_id, player_id, champion, role, lane,
        kills, deaths, assists, cs, gold_earned,
        damage_dealt, damage_taken, vision_score, win,
        game_duration, game_mode, game_type, queue_id,
        spell1_id, spell2_id, item0, item1, item2, item3, item4, item5, item6,
        kda, date, region
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      ON CONFLICT (match_id, player_id) DO NOTHING
      RETURNING *
    `;

    const values = [
      match_id, player_id, champion, role, lane,
      kills, deaths, assists, cs, gold_earned,
      damage_dealt, damage_taken, vision_score, win,
      game_duration, game_mode, game_type, queue_id,
      spell1_id, spell2_id, item0, item1, item2, item3, item4, item5, item6,
      kda, date, region || 'br1'
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  /**
   * Get matches by player ID
   */
  static async getMatchesByPlayerId(playerId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM matches
      WHERE player_id = $1
      ORDER BY date DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [playerId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching matches by player ID:', error);
      throw error;
    }
  }

  /**
   * Get match by match ID
   */
  static async getMatchByMatchId(matchId) {
    const query = 'SELECT * FROM matches WHERE match_id = $1';

    try {
      const result = await pool.query(query, [matchId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching match by match ID:', error);
      throw error;
    }
  }

  /**
   * Check if match exists for player
   */
  static async matchExistsForPlayer(matchId, playerId) {
    const query = 'SELECT COUNT(*) as count FROM matches WHERE match_id = $1 AND player_id = $2';

    try {
      const result = await pool.query(query, [matchId, playerId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking if match exists:', error);
      throw error;
    }
  }

  /**
   * Get recent matches across all players
   */
  static async getRecentMatches(limit = 50) {
    const query = `
      SELECT m.*, p.name as player_name, p.team_id, t.name as team_name
      FROM matches m
      JOIN players p ON m.player_id = p.id
      LEFT JOIN teams t ON p.team_id = t.id
      ORDER BY m.date DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      throw error;
    }
  }

  /**
   * Get matches by champion
   */
  static async getMatchesByChampion(champion, limit = 100) {
    const query = `
      SELECT m.*, p.name as player_name, p.team_id, t.name as team_name
      FROM matches m
      JOIN players p ON m.player_id = p.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE LOWER(m.champion) = LOWER($1)
      ORDER BY m.date DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [champion, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching matches by champion:', error);
      throw error;
    }
  }

  /**
   * Get player's match history with stats
   */
  static async getPlayerMatchHistory(playerId, limit = 20) {
    const query = `
      SELECT 
        m.*,
        CASE 
          WHEN m.win = true THEN 'VITÓRIA'
          ELSE 'DERROTA'
        END as result_text
      FROM matches m
      WHERE m.player_id = $1
      ORDER BY m.date DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [playerId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching player match history:', error);
      throw error;
    }
  }

  /**
   * Delete match by ID
   */
  static async deleteMatch(id) {
    const query = 'DELETE FROM matches WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  }

  /**
   * Get total matches count
   */
  static async getTotalMatchesCount() {
    const query = 'SELECT COUNT(*) as count FROM matches';

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting matches:', error);
      throw error;
    }
  }

  /**
   * Get matches count by player
   */
  static async getMatchesCountByPlayer(playerId) {
    const query = 'SELECT COUNT(*) as count FROM matches WHERE player_id = $1';

    try {
      const result = await pool.query(query, [playerId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting matches by player:', error);
      throw error;
    }
  }
}

module.exports = MatchService;

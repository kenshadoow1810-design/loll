const pool = require('../config/database');

/**
 * Team Service - handles all team-related database operations
 */
class TeamService {
  /**
   * Create a new team
   */
  static async createTeam(teamData) {
    const { name, logo_url, region, league } = teamData;

    const query = `
      INSERT INTO teams (name, logo_url, region, league)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        region = EXCLUDED.region,
        league = EXCLUDED.league,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [name, logo_url || null, region || null, league || null];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  static async getTeamById(id) {
    const query = 'SELECT * FROM teams WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching team by ID:', error);
      throw error;
    }
  }

  /**
   * Get team by name
   */
  static async getTeamByName(name) {
    const query = 'SELECT * FROM teams WHERE LOWER(name) = LOWER($1)';

    try {
      const result = await pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching team by name:', error);
      throw error;
    }
  }

  /**
   * Get all teams
   */
  static async getAllTeams(region = null) {
    let query = 'SELECT * FROM teams';
    const params = [];

    if (region) {
      query += ' WHERE region = $1';
      params.push(region);
    }

    query += ' ORDER BY name ASC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all teams:', error);
      throw error;
    }
  }

  /**
   * Get teams by league
   */
  static async getTeamsByLeague(league) {
    const query = `
      SELECT * FROM teams
      WHERE LOWER(league) = LOWER($1)
      ORDER BY name ASC
    `;

    try {
      const result = await pool.query(query, [league]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching teams by league:', error);
      throw error;
    }
  }

  /**
   * Get teams by region
   */
  static async getTeamsByRegion(region) {
    const query = `
      SELECT * FROM teams
      WHERE region = $1
      ORDER BY name ASC
    `;

    try {
      const result = await pool.query(query, [region]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching teams by region:', error);
      throw error;
    }
  }

  /**
   * Update team
   */
  static async updateTeam(id, teamData) {
    const { name, logo_url, region, league } = teamData;

    const query = `
      UPDATE teams
      SET name = COALESCE($1, name),
          logo_url = COALESCE($2, logo_url),
          region = COALESCE($3, region),
          league = COALESCE($4, league),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [name, logo_url, region, league, id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete team by ID
   */
  static async deleteTeam(id) {
    const query = 'DELETE FROM teams WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  /**
   * Get total teams count
   */
  static async getTotalTeamsCount() {
    const query = 'SELECT COUNT(*) as count FROM teams';

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting teams:', error);
      throw error;
    }
  }
}

module.exports = TeamService;

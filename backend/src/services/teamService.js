import pool from '../config/database.js';

class TeamService {
  async getAllTeams() {
    const query = 'SELECT * FROM teams ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  async getTeamById(id) {
    const query = 'SELECT * FROM teams WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getTeamsByLeague(league) {
    const query = 'SELECT * FROM teams WHERE region = $1 ORDER BY name ASC';
    const result = await pool.query(query, [league]);
    return result.rows;
  }

  async getTeamPlayers(teamId) {
    const query = `
      SELECT p.*, t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = $1
      ORDER BY p.rank ASC
    `;
    const result = await pool.query(query, [teamId]);
    return result.rows;
  }
}

export default new TeamService();

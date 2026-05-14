import pool from '../config/database.js';

class ScheduleService {
  async getUpcomingMatches(filters = {}) {
    const { league, date } = filters;
    let query = 'SELECT * FROM schedule WHERE match_date >= NOW()';
    const values = [];
    let paramIndex = 1;

    if (league) {
      query += ` AND league = $${paramIndex}`;
      values.push(league);
      paramIndex++;
    }

    if (date) {
      query += ` AND DATE(match_date) = $${paramIndex}`;
      values.push(date);
      paramIndex++;
    }

    query += ' ORDER BY match_date ASC LIMIT 50';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getMatchesByDateRange(startDate, endDate) {
    const query = `
      SELECT * FROM schedule 
      WHERE match_date BETWEEN $1 AND $2
      ORDER BY match_date ASC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  async getMatchesByLeague(league) {
    const query = `
      SELECT * FROM schedule 
      WHERE league = $1 AND match_date >= NOW()
      ORDER BY match_date ASC
    `;
    const result = await pool.query(query, [league]);
    return result.rows;
  }
}

export default new ScheduleService();

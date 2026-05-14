import pool from '../config/database.js';

class NewsService {
  async getAllNews(limit = 20) {
    const query = 'SELECT * FROM news ORDER BY published_at DESC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getNewsById(id) {
    const query = 'SELECT * FROM news WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getRecentNews(limit = 10) {
    const query = 'SELECT * FROM news ORDER BY published_at DESC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

export default new NewsService();

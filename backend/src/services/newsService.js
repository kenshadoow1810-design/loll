const pool = require('../config/database');

/**
 * News Service - handles all news-related database operations
 */
class NewsService {
  /**
   * Create a new news article
   */
  static async createNews(newsData) {
    const {
      title,
      url,
      source,
      published_at,
      summary,
      image_url,
      category,
      region
    } = newsData;

    const query = `
      INSERT INTO news (title, url, source, published_at, summary, image_url, category, region)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (url) DO UPDATE SET
        title = EXCLUDED.title,
        source = EXCLUDED.source,
        published_at = EXCLUDED.published_at,
        summary = EXCLUDED.summary,
        image_url = EXCLUDED.image_url,
        category = EXCLUDED.category,
        region = EXCLUDED.region
      RETURNING *
    `;

    const values = [
      title, url, source || null, published_at || null,
      summary || null, image_url || null, category || null, region || null
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  /**
   * Get latest news
   */
  static async getLatestNews(limit = 20, category = null) {
    let query = 'SELECT * FROM news';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY published_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw error;
    }
  }

  /**
   * Get news by ID
   */
  static async getNewsById(id) {
    const query = 'SELECT * FROM news WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching news by ID:', error);
      throw error;
    }
  }

  /**
   * Get news by region
   */
  static async getNewsByRegion(region, limit = 20) {
    const query = `
      SELECT * FROM news
      WHERE region = $1
      ORDER BY published_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [region, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching news by region:', error);
      throw error;
    }
  }

  /**
   * Search news by title or summary
   */
  static async searchNews(searchTerm, limit = 20) {
    const query = `
      SELECT * FROM news
      WHERE LOWER(title) LIKE LOWER($1) OR LOWER(summary) LIKE LOWER($1)
      ORDER BY published_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  /**
   * Get news by category
   */
  static async getNewsByCategory(category, limit = 20) {
    const query = `
      SELECT * FROM news
      WHERE LOWER(category) = LOWER($1)
      ORDER BY published_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [category, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching news by category:', error);
      throw error;
    }
  }

  /**
   * Delete news by ID
   */
  static async deleteNews(id) {
    const query = 'DELETE FROM news WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  /**
   * Get total news count
   */
  static async getTotalNewsCount() {
    const query = 'SELECT COUNT(*) as count FROM news';

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting news:', error);
      throw error;
    }
  }

  /**
   * Get news from last N days
   */
  static async getRecentNews(days = 7, limit = 50) {
    const query = `
      SELECT * FROM news
      WHERE published_at >= NOW() - INTERVAL '${days} days'
      ORDER BY published_at DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent news:', error);
      throw error;
    }
  }
}

module.exports = NewsService;

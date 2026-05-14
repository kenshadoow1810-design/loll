import pool from '../config/database.js';

class PlayerService {
  async getAllPlayers(filters = {}) {
    const { team, league, search } = filters;
    let query = 'SELECT * FROM players WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (team) {
      query += ` AND team_id = $${paramIndex}`;
      values.push(team);
      paramIndex++;
    }

    if (league) {
      query += ` AND league = $${paramIndex}`;
      values.push(league);
      paramIndex++;
    }

    if (search) {
      query += ` AND name ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY rank ASC LIMIT 100';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getPlayerById(id) {
    const query = 'SELECT * FROM players WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getPlayerByPuuid(puuid) {
    const query = 'SELECT * FROM players WHERE puuid = $1';
    const result = await pool.query(query, [puuid]);
    return result.rows[0] || null;
  }

  async getTopPlayers(limit = 10) {
    const query = 'SELECT * FROM players ORDER BY rank ASC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getPlayerStats(playerId) {
    const query = `
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN win = true THEN 1 ELSE 0 END) as wins,
        AVG(kills) as avg_kills,
        AVG(deaths) as avg_deaths,
        AVG(assists) as avg_assists,
        ROUND(AVG(kills + assists) / NULLIF(AVG(deaths), 0), 2) as kda
      FROM matches
      WHERE player_id = $1
    `;
    const result = await pool.query(query, [playerId]);
    return result.rows[0];
  }

  async getMostPlayedChampions(playerId, limit = 5) {
    const query = `
      SELECT champion, COUNT(*) as games_played
      FROM matches
      WHERE player_id = $1
      GROUP BY champion
      ORDER BY games_played DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [playerId, limit]);
    return result.rows;
  }

  async comparePlayers(player1Id, player2Id) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.team_id,
        t.name as team_name,
        p.role,
        p.rank,
        COUNT(m.id) as total_matches,
        SUM(CASE WHEN m.win = true THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(m.kills), 2) as avg_kills,
        ROUND(AVG(m.deaths), 2) as avg_deaths,
        ROUND(AVG(m.assists), 2) as avg_assists,
        ROUND(AVG(m.kills + m.assists) / NULLIF(AVG(m.deaths), 0), 2) as kda,
        ROUND(
          (SUM(CASE WHEN m.win = true THEN 1 ELSE 0 END)::FLOAT / COUNT(m.id)) * 100, 
          2
        ) as winrate
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN matches m ON p.id = m.player_id
      WHERE p.id IN ($1, $2)
      GROUP BY p.id, t.name
    `;
    const result = await pool.query(query, [player1Id, player2Id]);
    return result.rows;
  }
}

export default new PlayerService();

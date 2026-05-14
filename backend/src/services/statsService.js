import pool from '../config/database.js';

class StatsService {
  async getGlobalTopPlayersKDA(limit = 5) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.team_id,
        t.name as team_name,
        p.role,
        COUNT(m.id) as total_matches,
        ROUND(AVG(m.kills), 2) as avg_kills,
        ROUND(AVG(m.deaths), 2) as avg_deaths,
        ROUND(AVG(m.assists), 2) as avg_assists,
        ROUND(
          (AVG(m.kills) + AVG(m.assists)) / NULLIF(AVG(m.deaths), 0), 
          2
        ) as kda
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN matches m ON p.id = m.player_id
      WHERE m.id IS NOT NULL
      GROUP BY p.id, t.name
      HAVING COUNT(m.id) > 0
      ORDER BY kda DESC NULLS LAST
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getMostPlayedChampionsGlobal(limit = 10) {
    const query = `
      SELECT 
        champion,
        COUNT(*) as games_played,
        ROUND(
          (SUM(CASE WHEN win = true THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100, 
          2
        ) as winrate
      FROM matches
      GROUP BY champion
      ORDER BY games_played DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getPlayerRankings(league = null) {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.team_id,
        t.name as team_name,
        p.role,
        p.rank,
        p.league,
        COUNT(m.id) as total_matches,
        SUM(CASE WHEN m.win = true THEN 1 ELSE 0 END) as wins,
        ROUND(
          (SUM(CASE WHEN m.win = true THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(m.id), 0)) * 100, 
          2
        ) as winrate
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN matches m ON p.id = m.player_id
    `;

    if (league) {
      query += ' WHERE p.league = $1';
    }

    query += `
      GROUP BY p.id, t.name
      ORDER BY p.rank ASC
      LIMIT 50
    `;

    const values = league ? [league] : [];
    const result = await pool.query(query, values);
    return result.rows;
  }

  async getLeagueStats(league) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_players,
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT m.id) as total_matches,
        ROUND(AVG(m.kills), 2) as avg_kills_per_game,
        ROUND(AVG(m.duration_minutes), 2) as avg_game_duration
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN matches m ON p.id = m.player_id
      WHERE p.league = $1
    `;
    const result = await pool.query(query, [league]);
    return result.rows[0];
  }
}

export default new StatsService();

const pool = require('../config/database');

const getTeams = async (req, res) => {
  try {
    const { league } = req.params;
    
    let query;
    let values;
    
    if (league) {
      query = 'SELECT * FROM teams WHERE league = $1 ORDER BY wins DESC';
      values = [league];
    } else {
      query = 'SELECT * FROM teams ORDER BY league, wins DESC';
      values = [];
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    

    const teamQuery = 'SELECT * FROM teams WHERE id = $1';
    const teamResult = await pool.query(teamQuery, [id]);
    
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    
    const team = teamResult.rows[0];
    

    const playersQuery = `
      SELECT * FROM players 
      WHERE team_name = $1 
      ORDER BY 
        CASE position 
          WHEN 'TOP' THEN 1 
          WHEN 'JUNGLE' THEN 2 
          WHEN 'MID' THEN 3 
          WHEN 'ADC' THEN 4 
          WHEN 'SUPPORT' THEN 5 
          ELSE 6 
        END
    `;
    const playersResult = await pool.query(playersQuery, [team.name]);
    

    const players = playersResult.rows.map(player => ({
      id: player.id.toString(),
      name: player.name,
      team: player.team_name || 'Unknown',
      teamLogo: player.logo_url || null,
      image_url: player.image_url || null,
      league: player.league,
      role: player.position || 'Unknown',
      region: getRegionFromLeague(player.league),
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.cspm) || 0,
      kp: parseFloat(player.kill_participation) || 0,
      wr: player.win_percentage ? Math.round(player.win_percentage) : 0,
      games: player.games_played || 0,
      damage: Math.floor(parseFloat(player.dpm) * 20) || 0,
      gold: Math.floor(parseFloat(player.gold_per_min) * 10) || 0,
    }));
    
    const teamData = {
      id: team.id.toString(),
      name: team.name,
      league: team.league,
      logo_url: team.logo_url || null,
      games: team.games_played || 0,
      wins: team.wins || 0,
      losses: team.losses || 0,
      region: getRegionFromLeague(team.league),
      players: players,
    };
    
    res.json(teamData);
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getPlayers = async (req, res) => {
  try {
    const { league } = req.params;
    const { position } = req.query;
    
    let query = 'SELECT * FROM players WHERE 1=1';
    const values = [];
    let paramCount = 1;
    
    if (league) {
      query += ` AND league = $${paramCount}`;
      values.push(league);
      paramCount++;
    }
    
    if (position) {
      query += ` AND position = $${paramCount}`;
      values.push(position);
      paramCount++;
    }
    
    query += ' ORDER BY kda DESC';
    
    const result = await pool.query(query, values);
    

    const players = result.rows.map(player => ({
      id: player.id.toString(),
      name: player.name,
      team: player.team_name || 'Unknown',
      teamLogo: player.logo_url || null,
      image_url: player.image_url || null,
      league: player.league,
      role: player.position || 'Unknown',
      region: getRegionFromLeague(player.league),
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.cspm) || 0,
      kp: parseFloat(player.kill_participation) || 0,
      wr: player.win_percentage ? Math.round(player.win_percentage) : 0,
      games: player.games_played || 0,
      damage: Math.floor(parseFloat(player.dpm) * 20) || 0,
      gold: Math.floor(parseFloat(player.gold_per_min) * 10) || 0,
    }));
    
    res.json(players);
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM players WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }
    
    const player = result.rows[0];
    const playerData = {
      id: player.id.toString(),
      name: player.name,
      team: player.team_name || 'Unknown',
      teamLogo: player.logo_url || null,
      image_url: player.image_url || null,
      league: player.league,
      role: player.position || 'Unknown',
      region: getRegionFromLeague(player.league),
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.cspm) || 0,
      kp: parseFloat(player.kill_participation) || 0,
      wr: player.win_percentage ? Math.round(player.win_percentage) : 0,
      games: player.games_played || 0,
      damage: Math.floor(parseFloat(player.dpm) * 20) || 0,
      gold: Math.floor(parseFloat(player.gold_per_min) * 10) || 0,
    };
    
    res.json(playerData);
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getChampionStats = async (req, res) => {
  try {
      const { role, league } = req.query;

      let query = 'SELECT * FROM champion_stats WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (role && role !== 'ALL') {
        query += ` AND role = $${paramCount}`;
        values.push(role.toUpperCase());
        paramCount++;
      }
      
      if (league && league !== 'GLOBAL') {
        query += ` AND league = $${paramCount}`;
        values.push(league.toUpperCase());
        paramCount++;
      }

      query += ' ORDER BY games_played DESC';
      
      const result = await pool.query(query, values);
    

    const champions = result.rows.map(champ => ({
      id: champ.id.toString(),
      championName: champ.champion_name,
      champion_name: champ.champion_name,
      role: champ.role,
      league: champ.league || 'GLOBAL',
      gamesPlayed: champ.games_played || 0,
      games_played: champ.games_played || 0,
      win_percentage: champ.win_percentage || 0,
      ban_percentage: champ.ban_percentage || 0,
      totalKills: champ.total_kills || 0,
      total_kills: champ.total_kills || 0,
      totalDeaths: champ.total_deaths || 0,
      total_deaths: champ.total_deaths || 0,
      totalAssists: champ.total_assists || 0,
      total_assists: champ.total_assists || 0,
      icon_url: champ.icon_url || null,
    }));
    
    res.json(champions);
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getTotalPlayersCount = async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as total FROM players';
    const result = await pool.query(query);
    const count = parseInt(result.rows[0].total) || 0;
    res.json({ total: count });
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getLastUpdateTime = async (req, res) => {
  try {

    const query = `
      SELECT 
        MAX(updated_at) as last_update 
      FROM (
        SELECT updated_at FROM matches WHERE updated_at IS NOT NULL
        UNION ALL
        SELECT updated_at FROM players WHERE updated_at IS NOT NULL
      ) as all_updates
    `;
    const result = await pool.query(query);
    const lastUpdate = result.rows[0]?.last_update;
    
    res.json({ 
      lastUpdate: lastUpdate || new Date().toISOString(),
      formatted: lastUpdate ? formatLastUpdate(lastUpdate) : 'Agora'
    });
  } catch (error) {

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getTeams, getTeamById, getPlayers, getPlayerById, getChampionStats, getTotalPlayersCount, getLastUpdateTime };

function formatLastUpdate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays}d`;
}

function getTeamLogo(teamName) {
  const logos = {
    'LOUD': '🔊',
    'paiN Gaming': '🎯',
    'FURIA': '🐾',
    'INTZ': '🔴',
    'Fluxo': '⚡',
    'RED Canids': '🔺',
    'KaBuM!': '💥',
    'LOS': '🦁',
    'T1': '🏆',
    'Gen.G': '🟡',
    'DRX': '🐉',
    'G2 Esports': '🎮',
    'Fnatic': '🟠',
    'Cloud9': '☁️',
    'Team Liquid': '🌊',
    'JD Gaming': '🔴',
    'Bilibili Gaming': '📺',
  };
  return logos[teamName] || '🎮';
}

function getRegionFromLeague(league) {
  const regions = {
    'CBLOL': 'BR',
    'LCK': 'KR',
    'LEC': 'EU',
    'LCS': 'NA',
    'LPL': 'CN',
  };
  return regions[league] || 'Unknown';
}

function calculateWinRate(gamesPlayed, wins) {
  if (!gamesPlayed || gamesPlayed === 0) return 0;
  return Math.round((wins / gamesPlayed) * 100);
}

function calculateKDA(kills, deaths, assists) {
  if (!deaths || deaths === 0) return kills + assists;
  return parseFloat(((kills + assists) / deaths).toFixed(2));
}

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
    console.error('Erro ao buscar times:', error);
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
    
    // Transformar dados do banco para o formato esperado pelo frontend
    const players = result.rows.map(player => ({
      id: player.id.toString(),
      name: player.name,
      team: player.team_name || 'Unknown',
      teamLogo: getTeamLogo(player.team_name),
      league: player.league,
      role: player.position || 'Unknown',
      region: getRegionFromLeague(player.league),
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.cspm) || 0,
      kp: parseFloat(player.kill_participation) || 0,
      wr: calculateWinRate(player.games_played, player.wins),
      games: player.games_played || 0,
      damage: Math.floor(parseFloat(player.dpm) * 20) || 0,
      gold: Math.floor(parseFloat(player.gold_per_10) * 100) || 0,
    }));
    
    res.json(players);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
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
      teamLogo: getTeamLogo(player.team_name),
      league: player.league,
      role: player.position || 'Unknown',
      region: getRegionFromLeague(player.league),
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.cspm) || 0,
      kp: parseFloat(player.kill_participation) || 0,
      wr: calculateWinRate(player.games_played, player.wins),
      games: player.games_played || 0,
      damage: Math.floor(parseFloat(player.dpm) * 20) || 0,
      gold: Math.floor(parseFloat(player.gold_per_10) * 100) || 0,
    };
    
    res.json(playerData);
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getChampionStats = async (req, res) => {
  try {
    const query = 'SELECT * FROM champion_stats ORDER BY games_played DESC';
    const result = await pool.query(query);
    
    // Transformar dados para incluir cálculos derivados
    const champions = result.rows.map(champ => ({
      id: champ.id.toString(),
      championName: champ.champion_name,
      role: champ.role,
      gamesPlayed: champ.games_played || 0,
      wins: champ.wins || 0,
      bans: champ.bans || 0,
      winRate: calculateWinRate(champ.games_played, champ.wins),
      kda: calculateKDA(champ.total_kills, champ.total_deaths, champ.total_assists),
      totalKills: champ.total_kills || 0,
      totalDeaths: champ.total_deaths || 0,
      totalAssists: champ.total_assists || 0,
    }));
    
    res.json(champions);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de campeões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getTeams, getPlayers, getPlayerById, getChampionStats };

// Helper functions
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

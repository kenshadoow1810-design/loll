const pool = require('../config/database');
const { scrapePlayers, scrapeTeams } = require('./scrapingService');

function normalizePlayerData(rawPlayer) {
  const keys = Object.keys(rawPlayer);
  
  const findKey = (patterns) => {
    return keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));
  };

  const nameKey = findKey(['player', 'name', 'summoner']);
  const teamKey = findKey(['team', 'org']);
  const positionKey = findKey(['position', 'role', 'lane']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const kdaKey = findKey(['kda']);
  const kpKey = findKey(['kill participation', 'kp%']);
  const goldKey = findKey(['gold per 10', 'gold@10', 'gpm']);
  const dpmKey = findKey(['dpm', 'damage per minute']);
  const cspmKey = findKey(['cspm', 'cs per minute', 'cs/min']);

  return {
    name: rawPlayer[nameKey] || 'Unknown',
    team_name: rawPlayer[teamKey] || null,
    position: rawPlayer[positionKey] || null,
    games_played: parseInt(rawPlayer[gamesKey]) || 0,
    kda: parseFloat(rawPlayer[kdaKey]) || 0,
    kill_participation: parseFloat(rawPlayer[kpKey]) || 0,
    gold_per_10: parseFloat(rawPlayer[goldKey]) || 0,
    dpm: parseFloat(rawPlayer[dpmKey]) || 0,
    cspm: parseFloat(rawPlayer[cspmKey]) || 0,
    league: rawPlayer.league
  };
}

function normalizeTeamData(rawTeam) {
  const keys = Object.keys(rawTeam);
  
  const findKey = (patterns) => {
    return keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));
  };

  const nameKey = findKey(['team', 'name', 'org']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winsKey = findKey(['wins', 'w', 'win']);
  const lossesKey = findKey(['losses', 'l', 'loss']);

  return {
    name: rawTeam[nameKey] || 'Unknown',
    games_played: parseInt(rawTeam[gamesKey]) || 0,
    wins: parseInt(rawTeam[winsKey]) || 0,
    losses: parseInt(rawTeam[lossesKey]) || 0,
    league: rawTeam.league
  };
}

async function savePlayersToDB(players) {
  console.log(`Salvando ${players.length} jogadores no banco...`);
  
  for (const player of players) {
    const normalized = normalizePlayerData(player);
    
    const query = `
      INSERT INTO players (name, team_name, position, league, games_played, kda, kill_participation, gold_per_10, dpm, cspm, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        team_name = EXCLUDED.team_name,
        position = EXCLUDED.position,
        games_played = EXCLUDED.games_played,
        kda = EXCLUDED.kda,
        kill_participation = EXCLUDED.kill_participation,
        gold_per_10 = EXCLUDED.gold_per_10,
        dpm = EXCLUDED.dpm,
        cspm = EXCLUDED.cspm,
        updated_at = NOW()
    `;
    
    const values = [
      normalized.name,
      normalized.team_name,
      normalized.position,
      normalized.league,
      normalized.games_played,
      normalized.kda,
      normalized.kill_participation,
      normalized.gold_per_10,
      normalized.dpm,
      normalized.cspm
    ];
    
    await pool.query(query, values);
  }
  
  console.log('Jogadores salvos com sucesso!');
}

async function saveTeamsToDB(teams) {
  console.log(`Salvando ${teams.length} times no banco...`);
  
  for (const team of teams) {
    const normalized = normalizeTeamData(team);
    
    const query = `
      INSERT INTO teams (name, league, games_played, wins, losses, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        updated_at = NOW()
    `;
    
    const values = [
      normalized.name,
      normalized.league,
      normalized.games_played,
      normalized.wins,
      normalized.losses
    ];
    
    await pool.query(query, values);
  }
  
  console.log('Times salvos com sucesso!');
}

async function runExtraction() {
  try {
    console.log('=== Iniciando Pipeline de Extração ===');
    
    const players = await scrapePlayers();
    await savePlayersToDB(players);
    
    const teams = await scrapeTeams();
    await saveTeamsToDB(teams);
    
    console.log('=== Pipeline Concluída com Sucesso ===');
  } catch (error) {
    console.error('Erro na pipeline de extração:', error);
    throw error;
  }
}

module.exports = { runExtraction, savePlayersToDB, saveTeamsToDB };

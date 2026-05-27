const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Caminho absoluto e rígido para a pasta downloads
// Funciona tanto localmente quanto no GitHub Actions
const getDownloadsPath = () => {
  // Se estiver rodando dentro de src/services, sobe 2 níveis para chegar em backend
  // Se estiver em scripts, sobe 1 nível
  const baseDir = __dirname.includes('src/services') 
    ? path.join(__dirname, '..', '..', 'downloads') 
    : path.join(__dirname, '..', 'downloads');
  
  return path.resolve(baseDir);
};

async function saveChampionStatsToDB(champions, league) {
  console.log(`💾 Salvando ${champions.length} campeões da liga ${league}...`);
  let count = 0;
  for (const rawChamp of champions) {
    const champ = normalizeChampionData(rawChamp, league);
    
    const query = `
      INSERT INTO champion_stats (champion_name, role, league, games_played, win_percentage, ban_percentage, total_kills, total_deaths, total_assists, icon_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (champion_name, role, league) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        win_percentage = EXCLUDED.win_percentage,
        ban_percentage = EXCLUDED.ban_percentage,
        total_kills = EXCLUDED.total_kills,
        total_deaths = EXCLUDED.total_deaths,
        total_assists = EXCLUDED.total_assists,
        icon_url = COALESCE(EXCLUDED.icon_url, champion_stats.icon_url),
        updated_at = NOW()
    `;

    const values = [
      champ.champion_name,
      champ.role,
      champ.league,
      champ.games_played || 0,
      champ.win_percentage || 0,
      champ.ban_percentage || 0,
      champ.kills || 0,
      champ.deaths || 0,
      champ.assists || 0,
      champ.icon_url || null
    ];

    await pool.query(query, values);
    count++;
  }
  console.log(`✅ ${count} campeões salvos com sucesso.`);
}

function normalizePlayerData(rawPlayer, league) {
  const keys = Object.keys(rawPlayer);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  return {
    name: rawPlayer[findKey(['player', 'name', 'summoner'])] || 'Unknown',
    team_name: rawPlayer[findKey(['team', 'org'])] || null,
    position: rawPlayer[findKey(['pos', 'position', 'role'])] || null,
    games_played: parseInt(rawPlayer[findKey(['games', 'gp'])]) || 0,
    kda: parseFloat(rawPlayer[findKey(['kda'])]) || 0,
    kill_participation: parseFloat(rawPlayer[findKey(['kp', 'kill participation'])]) || 0,
    gold_per_min: parseFloat(rawPlayer[findKey(['gold', 'gpm'])]) || 0,
    dpm: parseFloat(rawPlayer[findKey(['dpm'])]) || 0,
    cspm: parseFloat(rawPlayer[findKey(['cs', 'cspm'])]) || 0,
    win_percentage: parseFloat((rawPlayer[findKey(['win %', 'win%'])] || '0').replace('%', '')) || 0,
    league: league, // Força a liga vinda do arquivo
    real_name: rawPlayer.real_name || null,
    image_url: rawPlayer.image_url || null
  };
}

function normalizeTeamData(rawTeam, league) {
  const keys = Object.keys(rawTeam);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  return {
    name: rawTeam[findKey(['team', 'name', 'org'])] || 'Unknown',
    games_played: parseInt(rawTeam[findKey(['games', 'gp'])]) || 0,
    wins: parseInt(rawTeam[findKey(['wins', 'w'])]) || 0,
    losses: parseInt(rawTeam[findKey(['losses', 'l'])]) || 0,
    league: league, // Força a liga vinda do arquivo
    logo_url: rawTeam.logo_url || null
  };
}

function normalizeChampionData(rawChampion, league) {
  const keys = Object.keys(rawChampion);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  const winPctRaw = rawChampion[findKey(['win %', 'win%'])] || '0';
  const banPctRaw = rawChampion[findKey(['ban %', 'ban%', 'bans %'])] || '0';

  return {
    champion_name: rawChampion[findKey(['champion', 'champ', 'name'])] || 'Unknown',
    role: (rawChampion[findKey(['role', 'lane'])] || 'UNKNOWN').trim().toUpperCase(),
    games_played: parseInt(rawChampion[findKey(['games', 'gp'])]) || 0,
    win_percentage: parseFloat(winPctRaw.replace('%', '')) || 0,
    ban_percentage: parseFloat(banPctRaw.replace('%', '')) || 0,
    kills: parseInt(rawChampion[findKey(['kills', 'k'])]) || 0,
    deaths: parseInt(rawChampion[findKey(['deaths', 'd'])]) || 0,
    assists: parseInt(rawChampion[findKey(['assists', 'a'])]) || 0,
    icon_url: rawChampion[findKey(['icon', 'image'])] || null,
    league: league // Força a liga vinda do arquivo
  };
}

async function savePlayersToDB(players, league) {
  console.log(`💾 Salvando ${players.length} jogadores da liga ${league}...`);
  let count = 0;
  for (const player of players) {
    const normalized = normalizePlayerData(player, league);
    const safeWinPercentage = Math.min(Math.max(normalized.win_percentage || 0, 0), 100);

    const query = `
      INSERT INTO players (name, team_name, position, league, games_played, kda, kill_participation, gold_per_min, dpm, cspm, win_percentage, real_name, image_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        team_name = EXCLUDED.team_name,
        position = EXCLUDED.position,
        games_played = EXCLUDED.games_played,
        kda = EXCLUDED.kda,
        kill_participation = EXCLUDED.kill_participation,
        gold_per_min = EXCLUDED.gold_per_min,
        dpm = EXCLUDED.dpm,
        cspm = EXCLUDED.cspm,
        win_percentage = EXCLUDED.win_percentage,
        real_name = COALESCE(EXCLUDED.real_name, players.real_name),
        image_url = COALESCE(EXCLUDED.image_url, players.image_url),
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
      normalized.gold_per_min,
      normalized.dpm,
      normalized.cspm,
      safeWinPercentage,
      normalized.real_name || null,
      normalized.image_url || null
    ];

    await pool.query(query, values);
    count++;
  }
  console.log(`✅ ${count} jogadores salvos com sucesso.`);
}

async function saveTeamsToDB(teams, league) {
  console.log(`💾 Salvando ${teams.length} times da liga ${league}...`);
  let count = 0;
  for (const team of teams) {
    const normalized = normalizeTeamData(team, league);

    const query = `
      INSERT INTO teams (name, league, games_played, wins, losses, logo_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        logo_url = COALESCE(EXCLUDED.logo_url, teams.logo_url),
        updated_at = NOW()
    `;

    const values = [
      normalized.name,
      normalized.league,
      normalized.games_played,
      normalized.wins,
      normalized.losses,
      normalized.logo_url || null
    ];

    await pool.query(query, values);
    count++;
  }
  console.log(`✅ ${count} times salvos com sucesso.`);
}

function extractLeagueFromFilename(filename) {
  // Remove extensão
  const nameNoExt = filename.replace(/\.csv$/i, '');
  // Divide por _ ou .
  const parts = nameNoExt.split(/[_\.]/);
  
  const knownLeagues = ['lcs', 'lec', 'lck', 'lpl', 'cblol', 'lco', 'lla', 'vcs', 'pcs', 'ljl', 'lcl', 'tur'];
  
  for (const part of parts) {
    if (knownLeagues.includes(part.toLowerCase())) {
      return part.toUpperCase();
    }
  }
  return 'GLOBAL';
}

async function runExtractionFromCSV() {
  const downloadsDir = getDownloadsPath();
  
  console.log('🔍 Procurando arquivos em:', downloadsDir);

  if (!fs.existsSync(downloadsDir)) {
    console.error('❌ ERRO CRÍTICO: A pasta downloads NÃO existe neste caminho.');
    throw new Error('Pasta downloads não encontrada');
  }

  const files = fs.readdirSync(downloadsDir).filter(f => f.endsWith('.csv'));
  
  console.log(`📂 Arquivos CSV encontrados: ${files.length}`);
  console.log('📄 Lista de arquivos:', files);

  if (files.length === 0) {
    console.warn('⚠️ Nenhum arquivo CSV encontrado. O processo será encerrado sem erros, mas sem dados.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(downloadsDir, file);
    const league = extractLeagueFromFilename(file);
    
    console.log(`\n🚀 Processando: ${file} | Liga Detectada: ${league}`);

    const results = [];
    
    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      if (results.length === 0) {
        console.log(`⚠️ Arquivo ${file} está vazio ou tem apenas cabeçalho.`);
        continue;
      }

      const lowerFile = file.toLowerCase();
      if (lowerFile.includes('player')) {
        await savePlayersToDB(results, league);
      } else if (lowerFile.includes('team')) {
        await saveTeamsToDB(results, league);
      } else if (lowerFile.includes('champ')) {
        await saveChampionStatsToDB(results, league);
      } else {
        console.log(`⚠️ Arquivo ${file} ignorado (nome não contém 'player', 'team' ou 'champ').`);
      }

    } catch (err) {
      console.error(`❌ Erro ao ler/processar ${file}:`, err.message);
      throw err;
    }
  }
  
  console.log('\n🎉 Pipeline de extração concluído!');
}

module.exports = { runExtractionFromCSV };

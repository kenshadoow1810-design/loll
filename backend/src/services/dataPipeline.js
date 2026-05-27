const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Caminho absoluto e fixo para a pasta downloads dentro de backend
// Se este arquivo estiver em backend/src/services, sobe dois níveis para chegar em backend/
const BACKEND_ROOT = path.join(__dirname, '..', '..');
const DOWNLOADS_DIR = path.join(BACKEND_ROOT, 'downloads');

/**
 * Extrai a liga do nome do arquivo.
 * Ex: players_lck.csv -> LCK, teams.cblol.csv -> CBLol
 */
function extractLeagueFromFilename(filename) {
  // Remove extensão .csv
  const nameWithoutExt = filename.replace(/\.csv$/i, '');
  
  // Tenta separar por _ ou .
  const parts = nameWithoutExt.split(/[_\.]/);
  
  const knownLeagues = ['lcs', 'lec', 'lck', 'lpl', 'cblol', 'lco', 'lla', 'vcs', 'pcs', 'ljl', 'lcl', 'tur', 'global'];
  
  // Procura uma parte que seja uma liga conhecida
  for (const part of parts) {
    const upperPart = part.toUpperCase();
    if (knownLeagues.includes(part.toLowerCase())) {
      return upperPart;
    }
  }

  // Se não achar conhecido, assume que a liga é a última parte do nome (ex: players_LIGA)
  if (parts.length > 1) {
    return parts[parts.length - 1].toUpperCase();
  }

  return 'GLOBAL';
}

async function saveChampionStatsToDB(champions, leagueOverride) {
  console.log(`💾 Salvando ${champions.length} campeões para a liga ${leagueOverride}...`);
  
  for (const rawChamp of champions) {
    const champ = normalizeChampionData(rawChamp, leagueOverride);

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
  }
  console.log(`✅ Campeões salvos com sucesso.`);
}

function normalizePlayerData(rawPlayer, leagueOverride) {
  const keys = Object.keys(rawPlayer);

  const findKey = (patterns) => {
    return keys.find(k => patterns.some(p => k.toLowerCase() === p.toLowerCase() || k.toLowerCase().includes(p.toLowerCase())));
  };

  const nameKey = findKey(['player', 'name', 'summoner']);
  const teamKey = findKey(['team', 'org']);
  const positionKey = findKey(['pos', 'position', 'role', 'lane']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winsKey = findKey(['w ', ' w', 'wins ', ' wins']);
  const winPercentageKey = findKey(['win %', 'win%', 'win percentage', 'win_pct', 'w%']);
  const kdaKey = findKey(['kda']);
  const kpKey = findKey(['kp', 'kill participation']);
  const goldKey = findKey(['gold per 10', 'gold@10', 'gpm']);
  const dpmKey = findKey(['dpm', 'damage per minute']);
  const cspmKey = findKey(['cspm', 'cs per minute', 'cs/min']);

  const gamesPlayed = parseInt(rawPlayer[gamesKey]) || 0;
  let winPercentage = 0;

  if (winPercentageKey && rawPlayer[winPercentageKey]) {
    const rawWinPct = rawPlayer[winPercentageKey];
    winPercentage = parseFloat(String(rawWinPct).replace('%', '')) || 0;
  }

  return {
    name: rawPlayer[nameKey] || 'Unknown',
    team_name: rawPlayer[teamKey] || null,
    position: rawPlayer[positionKey] || null,
    games_played: gamesPlayed,
    kda: parseFloat(rawPlayer[kdaKey]) || 0,
    kill_participation: parseFloat(rawPlayer[kpKey]) || 0,
    gold_per_min: parseFloat(rawPlayer[goldKey]) || 0,
    dpm: parseFloat(rawPlayer[dpmKey]) || 0,
    cspm: parseFloat(rawPlayer[cspmKey]) || 0,
    win_percentage: winPercentage,
    league: leagueOverride, // Força a liga do arquivo
    real_name: rawPlayer.real_name || null,
    image_url: rawPlayer.image_url || null
  };
}

function normalizeTeamData(rawTeam, leagueOverride) {
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
    league: leagueOverride, // Força a liga do arquivo
    logo_url: rawTeam.logo_url || null
  };
}

function normalizeChampionData(rawChampion, leagueOverride) {
  const keys = Object.keys(rawChampion);

  const findKey = (patterns) => {
    return keys.find(k => {
      const keyLower = k.toLowerCase();
      return patterns.some(p => {
        if (p.length === 1) {
          return keyLower === p.toLowerCase();
        }
        return keyLower === p.toLowerCase() || keyLower.includes(p.toLowerCase());
      });
    });
  };

  const championKey = findKey(['champion', 'champ', 'name']);
  const roleKey = findKey(['role', 'lane', 'position']);
  const gamesKey = findKey(['games', 'gp', 'matches', 'games played']);
  const winPercentageKey = findKey(['win %', 'win%', 'win percentage', 'w%']);
  const banPercentageKey = findKey(['ban %', 'ban%', 'ban percentage', 'bans %', 'bans%']);
  const bansKey = findKey(['bans']);
  const killsKey = findKey(['kills', 'k']);
  const deathsKey = findKey(['deaths', 'd']);
  const assistsKey = findKey(['assists', 'a']);
  const iconKey = findKey(['icon', 'image', 'url']);

  let winPercentage = 0;
  if (winPercentageKey && rawChampion[winPercentageKey]) {
    const rawWinPct = rawChampion[winPercentageKey];
    winPercentage = parseFloat(String(rawWinPct).replace('%', '')) || 0;
  }

  let banPercentage = 0;
  if (banPercentageKey && rawChampion[banPercentageKey]) {
    const rawBanPct = rawChampion[banPercentageKey];
    banPercentage = parseFloat(String(rawBanPct).replace('%', '')) || 0;
  }

  return {
    champion_name: rawChampion[championKey] || 'Unknown',
    role: (rawChampion[roleKey] || 'UNKNOWN').trim().toUpperCase(),
    games_played: parseInt(rawChampion[gamesKey]) || 0,
    win_percentage: winPercentage,
    ban_percentage: banPercentage,
    bans: parseInt(rawChampion[bansKey]) || 0,
    kills: parseInt(rawChampion[killsKey]) || 0,
    deaths: parseInt(rawChampion[deathsKey]) || 0,
    assists: parseInt(rawChampion[assistsKey]) || 0,
    icon_url: rawChampion[iconKey] ? String(rawChampion[iconKey]).trim() : null,
    league: leagueOverride // Força a liga do arquivo
  };
}

async function savePlayersToDB(players, leagueOverride) {
  console.log(`💾 Salvando ${players.length} jogadores para a liga ${leagueOverride}...`);

  for (const player of players) {
    const normalized = normalizePlayerData(player, leagueOverride);
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
  }
  console.log(`✅ Jogadores salvos com sucesso.`);
}

async function saveTeamsToDB(teams, leagueOverride) {
  console.log(`💾 Salvando ${teams.length} times para a liga ${leagueOverride}...`);

  for (const team of teams) {
    const normalized = normalizeTeamData(team, leagueOverride);

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
  }
  console.log(`✅ Times salvos com sucesso.`);
}

async function runExtractionFromCSV() {
  console.log('🚀 INICIANDO EXTRAÇÃO DE CSVs...');
  console.log(`📂 Diretório alvo: ${DOWNLOADS_DIR}`);

  // Verificação rígida: se não existir, para com erro
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    throw new Error(`❌ ERRO CRÍTICO: O diretório ${DOWNLOADS_DIR} não existe no ambiente de execução.`);
  }

  const files = fs.readdirSync(DOWNLOADS_DIR).filter(f => f.endsWith('.csv'));
  
  console.log(`📄 Arquivos CSV encontrados: ${files.length}`);
  
  if (files.length === 0) {
    console.warn('⚠️ Nenhum arquivo CSV encontrado. O processo será encerrado sem ações.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    const league = extractLeagueFromFilename(file);
    
    console.log(`\n----------------------------------------`);
    console.log(`📝 Processando: ${file} | Liga Detectada: ${league}`);
    console.log(`----------------------------------------`);

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
        console.log(`⚠️ Arquivo ${file} está vazio ou inválido.`);
        continue;
      }

      const fileNameLower = file.toLowerCase();

      if (fileNameLower.includes('player')) {
        await savePlayersToDB(results, league);
      } else if (fileNameLower.includes('team')) {
        await saveTeamsToDB(results, league);
      } else if (fileNameLower.includes('champ')) {
        await saveChampionStatsToDB(results, league);
      } else {
        console.log(`⚠️ Arquivo ${file} ignorado: nome não contém 'player', 'team' ou 'champ'.`);
      }

    } catch (err) {
      console.error(`❌ Erro ao processar o arquivo ${file}:`, err.message);
      throw err; // Propaga o erro para falhar o workflow
    }
  }

  console.log('\n🎉 EXTRAÇÃO CONCLUÍDA COM SUCESSO!');
}

async function runExtraction() {
  // Redireciona diretamente para a função de CSV conforme solicitado
  return runExtractionFromCSV();
}

module.exports = { 
  runExtraction, 
  runExtractionFromCSV,
  savePlayersToDB, 
  saveTeamsToDB, 
  saveChampionStatsToDB, 
  normalizeChampionData 
};

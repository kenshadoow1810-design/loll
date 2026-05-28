const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Caminho absoluto e rigoroso para a pasta downloads dentro de backend
const getDownloadsDir = () => {
  // Se estiver em src/services, sobe dois níveis para chegar na raiz do backend
  // Se estiver na raiz do backend, usa o próprio __dirname
  const baseDir = __dirname.includes('src/services') 
    ? path.resolve(__dirname, '../../downloads') 
    : path.resolve(__dirname, 'downloads');
  
  return baseDir;
};

/**
 * Salva Campeões (Lógica padrão: Upsert por Nome+Role+Liga)
 */
async function saveChampionStatsToDB(champions, leagueOverride) {
  if (!champions || champions.length === 0) return;

  for (const rawChamp of champions) {
    const champ = normalizeChampionData(rawChamp, leagueOverride);
    const finalLeague = leagueOverride || champ.league || 'GLOBAL';

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
      finalLeague,
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
}

/**
 * Salva Times (Lógica padrão: Upsert por Nome+Liga)
 */
async function saveTeamsToDB(teams, leagueOverride) {
  if (!teams || teams.length === 0) return;

  for (const team of teams) {
    const normalized = normalizeTeamData(team, leagueOverride);
    const finalLeague = leagueOverride || normalized.league || 'GLOBAL';

    const query = `
      INSERT INTO teams (name, league, games_played, wins, losses, logo_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        games_played = teams.games_played + EXCLUDED.games_played,
        wins = teams.wins + EXCLUDED.wins,
        losses = teams.losses + EXCLUDED.losses,
        logo_url = COALESCE(EXCLUDED.logo_url, teams.logo_url),
        updated_at = NOW()
    `;

    const values = [
      normalized.name,
      finalLeague,
      normalized.games_played,
      normalized.wins,
      normalized.losses,
      normalized.logo_url || null
    ];

    await pool.query(query, values);
  }
}

/**
 * Salva Jogadores com LÓGICA DE SOMA (Acumulativo)
 * Se o jogador já existe (Nome + Liga), soma as estatísticas e recalcula as médias.
 */
async function savePlayersToDB(players, leagueOverride) {
  if (!players || players.length === 0) return;

  for (const player of players) {
    const normalized = normalizePlayerData(player, leagueOverride);
    const finalLeague = leagueOverride || normalized.league || 'GLOBAL';
    const safeWinPercentage = Math.min(Math.max(normalized.win_percentage || 0, 0), 100);

    // 1. Verifica se o jogador já existe nesta liga
    const checkQuery = `SELECT * FROM players WHERE name = $1 AND league = $2`;
    const existing = await pool.query(checkQuery, [normalized.name, finalLeague]);

    let finalGames = normalized.games_played;
    let finalWins = Math.round((safeWinPercentage / 100) * finalGames); // Estimativa de vitórias do novo batch
    let finalKDA = normalized.kda;
    let finalKP = normalized.kill_participation;
    let finalGold = normalized.gold_per_min;
    let finalDPM = normalized.dpm;
    let finalCSPM = normalized.cspm;
    
    // Totais absolutos para soma
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;

    // Calcula totais atuais baseados na média * jogos (aproximação)
    // Nota: O ideal é ter kills/deaths/assists totais no CSV. Se tiver, use-os. 
    // Aqui estamos assumindo que precisamos reconstruir ou somar as médias ponderadas.
    
    if (existing.rows.length > 0) {
      const old = existing.rows[0];
      
      // Soma Jogos
      finalGames = (old.games_played || 0) + normalized.games_played;
      
      // Soma Vitórias (Recalcula % baseada na soma)
      const oldWins = Math.round((old.win_percentage / 100) * old.games_played);
      const totalWins = oldWins + finalWins;
      const newWinPct = finalGames > 0 ? (totalWins / finalGames) * 100 : 0;

      // Soma Kills/Deaths/Assists (Se o CSV tiver esses campos totais, priorize-os. 
      // Se o CSV só tiver KDA, precisamos estimar. Assumindo que o CSV tem K, D, A ou que vamos somar as médias ponderadas)
      // MELHOR ABORDAGEM: Somar as métricas ponderadas diretamente.
      
      // Fórmula Média Ponderada: ((Val1 * Qtd1) + (Val2 * Qtd2)) / (Qtd1 + Qtd2)
      
      finalKDA = ((old.kda * old.games_played) + (normalized.kda * normalized.games_played)) / finalGames;
      finalKP = ((old.kill_participation * old.games_played) + (normalized.kill_participation * normalized.games_played)) / finalGames;
      finalGold = ((old.gold_per_min * old.games_played) + (normalized.gold_per_min * normalized.games_played)) / finalGames;
      finalDPM = ((old.dpm * old.games_played) + (normalized.dpm * normalized.games_played)) / finalGames;
      finalCSPM = ((old.cspm * old.games_played) + (normalized.cspm * normalized.games_played)) / finalGames;

      // Atualiza o objeto normalizado com os valores acumulados
      normalized.games_played = finalGames;
      normalized.win_percentage = newWinPct;
      normalized.kda = parseFloat(finalKDA.toFixed(2));
      normalized.kill_participation = parseFloat(finalKP.toFixed(2));
      normalized.gold_per_min = parseFloat(finalGold.toFixed(2));
      normalized.dpm = parseFloat(finalDPM.toFixed(2));
      normalized.cspm = parseFloat(finalCSPM.toFixed(2));
    }

    // Query de Insert/Update (O Update agora recebe os valores já somados/calculados acima)
    const query = `
      INSERT INTO players (name, team_name, position, league, games_played, kda, kill_participation, gold_per_min, dpm, cspm, win_percentage, real_name, image_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (name, league) DO UPDATE SET
        team_name = EXCLUDED.team_name, -- Mantém o time mais recente
        position = EXCLUDED.position,   -- Mantém a posição mais recente
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
      finalLeague,
      normalized.games_played,
      normalized.kda,
      normalized.kill_participation,
      normalized.gold_per_min,
      normalized.dpm,
      normalized.cspm,
      normalized.win_percentage,
      normalized.real_name || null,
      normalized.image_url || null
    ];

    await pool.query(query, values);
  }
}

function normalizePlayerData(rawPlayer, leagueOverride) {
  const keys = Object.keys(rawPlayer);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase())));

  const nameKey = findKey(['player', 'name', 'summoner']);
  const teamKey = findKey(['team', 'org']);
  const positionKey = findKey(['pos', 'position', 'role', 'lane']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winPercentageKey = findKey(['win %', 'win%', 'win percentage', 'w%']);
  const kdaKey = findKey(['kda']);
  const kpKey = findKey(['kp', 'kill participation']);
  const goldKey = findKey(['gold per 10', 'gold@10', 'gpm', 'gold/min']);
  const dpmKey = findKey(['dpm', 'damage per minute']);
  const cspmKey = findKey(['cspm', 'cs per minute', 'cs/min']);

  const gamesPlayed = parseInt(rawPlayer[gamesKey]) || 0;
  let winPercentage = 0;

  if (winPercentageKey && rawPlayer[winPercentageKey]) {
    winPercentage = parseFloat(String(rawPlayer[winPercentageKey]).replace('%', '')) || 0;
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
    league: leagueOverride, // Força a liga vinda do arquivo
    real_name: rawPlayer.real_name || null,
    image_url: rawPlayer.image_url || null
  };
}

function normalizeTeamData(rawTeam, leagueOverride) {
  const keys = Object.keys(rawTeam);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  const nameKey = findKey(['team', 'name', 'org']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winsKey = findKey(['wins', 'w', 'win']);
  const lossesKey = findKey(['losses', 'l', 'loss']);

  return {
    name: rawTeam[nameKey] || 'Unknown',
    games_played: parseInt(rawTeam[gamesKey]) || 0,
    wins: parseInt(rawTeam[winsKey]) || 0,
    losses: parseInt(rawTeam[lossesKey]) || 0,
    league: leagueOverride,
    logo_url: rawTeam.logo_url || null
  };
}

function normalizeChampionData(rawChampion, leagueOverride) {
  const keys = Object.keys(rawChampion);
  const findKey = (patterns) => keys.find(k => {
    const keyLower = k.toLowerCase();
    return patterns.some(p => keyLower === p.toLowerCase() || keyLower.includes(p.toLowerCase()));
  });

  const championKey = findKey(['champion', 'champ', 'name']);
  const roleKey = findKey(['role', 'lane', 'position']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winPercentageKey = findKey(['win %', 'win%', 'win percentage', 'w%']);
  const banPercentageKey = findKey(['ban %', 'ban%', 'ban percentage', 'bans %']);
  const killsKey = findKey(['kills', 'k']);
  const deathsKey = findKey(['deaths', 'd']);
  const assistsKey = findKey(['assists', 'a']);
  const iconKey = findKey(['icon', 'image', 'url']);

  let winPercentage = 0;
  if (winPercentageKey && rawChampion[winPercentageKey]) {
    winPercentage = parseFloat(String(rawChampion[winPercentageKey]).replace('%', '')) || 0;
  }

  let banPercentage = 0;
  if (banPercentageKey && rawChampion[banPercentageKey]) {
    banPercentage = parseFloat(String(rawChampion[banPercentageKey]).replace('%', '')) || 0;
  }

  return {
    champion_name: rawChampion[championKey] || 'Unknown',
    role: (rawChampion[roleKey] || 'UNKNOWN').trim().toUpperCase(),
    games_played: parseInt(rawChampion[gamesKey]) || 0,
    win_percentage: winPercentage,
    ban_percentage: banPercentage,
    kills: parseInt(rawChampion[killsKey]) || 0,
    deaths: parseInt(rawChampion[deathsKey]) || 0,
    assists: parseInt(rawChampion[assistsKey]) || 0,
    icon_url: rawChampion[iconKey] ? String(rawChampion[iconKey]).trim() : null,
    league: leagueOverride
  };
}

// Extrai a liga do nome do arquivo (ex: players_cblol_0.csv -> CBLOL)
function extractLeagueFromFilename(filename) {
  const nameWithoutExt = filename.replace('.csv', '');
  const parts = nameWithoutExt.split('_');
  
  // Procura por ligas conhecidas em qualquer parte do nome
  const knownLeagues = ['lcs', 'lec', 'lck', 'lpl', 'cblol', 'lco', 'lla', 'vcs', 'pcs', 'ljl', 'lcl', 'tur'];
  
  for (const part of parts) {
    if (knownLeagues.includes(part.toLowerCase())) {
      return part.toUpperCase();
    }
  }

  // Fallback: Se o formato for tipo_liga_numero, pega a segunda parte
  if (parts.length >= 2) {
    return parts[1].toUpperCase();
  }

  return 'GLOBAL';
}

async function runExtractionFromCSV() {
  const downloadsDir = getDownloadsDir();
  
  console.log(`🔍 Procurando CSVs em: ${downloadsDir}`);

  if (!fs.existsSync(downloadsDir)) {
    console.error(`❌ ERRO CRÍTICO: A pasta ${downloadsDir} NÃO EXISTE.`);
    throw new Error('Pasta downloads não encontrada');
  }

  const files = fs.readdirSync(downloadsDir).filter(f => f.endsWith('.csv'));
  
  if (files.length === 0) {
    console.warn('⚠️ Nenhum arquivo .csv encontrado na pasta downloads.');
    return;
  }

  console.log(`✅ Encontrados ${files.length} arquivos CSV: ${files.join(', ')}`);

  for (const file of files) {
    const filePath = path.join(downloadsDir, file);
    const league = extractLeagueFromFilename(file);
    
    console.log(`\n📂 Processando: ${file} | Liga Detectada: ${league}`);

    const results = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      console.log(`   ⚠️ Arquivo vazio: ${file}`);
      continue;
    }

    try {
      const lowerFile = file.toLowerCase();
      if (lowerFile.includes('player')) {
        await savePlayersToDB(results, league);
        console.log(`   ✅ ${results.length} jogadores processados (Dados somados se existentes).`);
      } else if (lowerFile.includes('team')) {
        await saveTeamsToDB(results, league);
        console.log(`   ✅ ${results.length} times processados.`);
      } else if (lowerFile.includes('champ')) {
        await saveChampionStatsToDB(results, league);
        console.log(`   ✅ ${results.length} campeões processados.`);
      } else {
        console.log(`   ⚠️ Arquivo ignorado (nome não contém player, team ou champ): ${file}`);
      }
    } catch (err) {
      console.error(`   ❌ Erro ao salvar dados de ${file}:`, err.message);
      throw err; // Propaga erro para falhar o workflow
    }
  }
  
  console.log('\n🎉 Extração concluída com sucesso!');
}

async function runExtraction() {
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

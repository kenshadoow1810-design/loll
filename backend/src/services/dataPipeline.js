const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Função auxiliar para encontrar a pasta backend/downloads em qualquer ambiente
function getDownloadsDir() {
  // Tenta caminhos comuns dependendo de onde o script é chamado
  const possiblePaths = [
    path.join(__dirname, '..', 'downloads'),       // Se chamado de src/services
    path.join(__dirname, '..', '..', 'downloads'), // Se chamado de src/scripts
    path.join(process.cwd(), 'backend', 'downloads'),
    path.join(__dirname, 'downloads')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  // Fallback absoluto baseado na estrutura comum de repositório
  const rootPath = path.resolve(__dirname, '../../../downloads');
  if (fs.existsSync(rootPath)) return rootPath;

  throw new Error(`Pasta downloads não encontrada em nenhum caminho esperado. Caminhos verificados: ${possiblePaths.join(', ')}`);
}

// --- FUNÇÕES DE NORMALIZAÇÃO ---

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
    name: (rawPlayer[nameKey] || 'Unknown').trim(),
    team_name: rawPlayer[teamKey] ? String(rawPlayer[teamKey]).trim() : null,
    position: rawPlayer[positionKey] ? String(rawPlayer[positionKey]).trim() : null,
    games_played: gamesPlayed,
    kda: parseFloat(rawPlayer[kdaKey]) || 0,
    kill_participation: parseFloat(rawPlayer[kpKey]) || 0,
    gold_per_min: parseFloat(rawPlayer[goldKey]) || 0,
    dpm: parseFloat(rawPlayer[dpmKey]) || 0,
    cspm: parseFloat(rawPlayer[cspmKey]) || 0,
    win_percentage: winPercentage,
    league: leagueOverride,
    real_name: rawPlayer.real_name || null,
    image_url: rawPlayer.image_url || null
  };
}

function normalizeTeamData(rawTeam, leagueOverride) {
  const keys = Object.keys(rawTeam);
  const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  const nameKey = findKey(['team', 'name', 'org']);
  const gamesKey = findKey(['games', 'gp', 'matches']);
  const winsKey = findKey(['wins', 'w']);
  const lossesKey = findKey(['losses', 'l']);

  return {
    name: (rawTeam[nameKey] || 'Unknown').trim(),
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
    champion_name: (rawChampion[championKey] || 'Unknown').trim(),
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

// --- FUNÇÕES DE SALVAMENTO COM LÓGICA DE ATUALIZAÇÃO SEGURA ---

async function savePlayersToDB(players, league) {
  if (!players || players.length === 0) return;

  console.log(`🧹 Limpando dados antigos de jogadores para a liga: ${league}...`);
  // PASSO CRÍTICO: Remove todos os jogadores desta liga antes de inserir os novos somados
  // Isso evita duplicação se o script for rodado múltiplas vezes
  await pool.query('DELETE FROM players WHERE league = $1', [league]);

  console.log(`💾 Inserindo ${players.length} registros de jogadores para ${league}...`);

  for (const player of players) {
    const safeWinPercentage = Math.min(Math.max(player.win_percentage || 0, 0), 100);

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
      player.name,
      player.team_name,
      player.position,
      player.league,
      player.games_played,
      player.kda,
      player.kill_participation,
      player.gold_per_min,
      player.dpm,
      player.cspm,
      safeWinPercentage,
      player.real_name || null,
      player.image_url || null
    ];

    await pool.query(query, values);
  }
}

async function saveTeamsToDB(teams, league) {
  if (!teams || teams.length === 0) return;

  console.log(`🧹 Limpando dados antigos de times para a liga: ${league}...`);
  await pool.query('DELETE FROM teams WHERE league = $1', [league]);

  console.log(`💾 Inserindo ${teams.length} registros de times para ${league}...`);

  for (const team of teams) {
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
      team.name,
      team.league,
      team.games_played,
      team.wins,
      team.losses,
      team.logo_url || null
    ];

    await pool.query(query, values);
  }
}

async function saveChampionStatsToDB(champions, league) {
  if (!champions || champions.length === 0) return;

  console.log(`🧹 Limpando dados antigos de campeões para a liga: ${league}...`);
  await pool.query('DELETE FROM champion_stats WHERE league = $1', [league]);

  console.log(`💾 Inserindo ${champions.length} registros de campeões para ${league}...`);

  for (const champ of champions) {
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
}

// --- LÓGICA PRINCIPAL DE EXTRAÇÃO ---

function extractLeagueFromFilename(filename) {
  // Remove extensão
  const nameWithoutExt = filename.replace(/\.csv$/i, '');
  
  // Divide por underscores ou pontos
  const parts = nameWithoutExt.split(/[_\.]/);
  
  const knownLeagues = ['lcs', 'lec', 'lck', 'lpl', 'cblol', 'lco', 'lla', 'vcs', 'pcs', 'ljl', 'lcl', 'tur'];
  
  // Procura uma parte que seja uma liga conhecida
  for (const part of parts) {
    if (knownLeagues.includes(part.toLowerCase())) {
      return part.toUpperCase();
    }
  }

  // Fallback: pega a segunda parte se existir (ex: players_LCK -> LCK)
  if (parts.length >= 2) {
    return parts[1].toUpperCase();
  }

  return 'GLOBAL';
}

async function runExtractionFromCSV() {
  let downloadsDir;
  try {
    downloadsDir = getDownloadsDir();
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    process.exit(1);
  }

  console.log(`📂 Lendo arquivos de: ${downloadsDir}`);
  
  if (!fs.existsSync(downloadsDir)) {
    console.error('❌ Pasta downloads não existe neste caminho.');
    process.exit(1);
  }

  const files = fs.readdirSync(downloadsDir)
    .filter(f => f.endsWith('.csv'))
    .sort(); // Ordena para garantir consistência
  
  if (files.length === 0) {
    console.warn('⚠️ Nenhum arquivo CSV encontrado na pasta downloads.');
    return;
  }

  console.log(`🔍 Encontrados ${files.length} arquivos CSV: ${files.join(', ')}`);

  // Agrupar dados por tipo e liga antes de salvar
  const dataToProcess = {
    players: {}, // { 'LIGA': [lista de players] }
    teams: {},
    champions: {}
  };

  // 1. Leitura de TODOS os arquivos
  for (const file of files) {
    const filePath = path.join(downloadsDir, file);
    const league = extractLeagueFromFilename(file);
    
    console.log(`\n📄 Processando arquivo: ${file} | Liga detectada: ${league}`);

    const results = [];
    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } catch (err) {
      console.error(`Erro ao ler ${file}:`, err.message);
      continue;
    }

    if (results.length === 0) continue;

    // Classificar os dados
    const fileNameLower = file.toLowerCase();
    if (fileNameLower.includes('player')) {
      if (!dataToProcess.players[league]) dataToProcess.players[league] = [];
      
      results.forEach(r => {
        const normalized = normalizePlayerData(r, league);
        dataToProcess.players[league].push(normalized);
      });
    } else if (fileNameLower.includes('team')) {
      if (!dataToProcess.teams[league]) dataToProcess.teams[league] = [];
      
      results.forEach(r => {
        const normalized = normalizeTeamData(r, league);
        dataToProcess.teams[league].push(normalized);
      });
    } else if (fileNameLower.includes('champ')) {
      if (!dataToProcess.champions[league]) dataToProcess.champions[league] = [];
      
      results.forEach(r => {
        const normalized = normalizeChampionData(r, league);
        dataToProcess.champions[league].push(normalized);
      });
    }
  }

  // 2. Salvamento no Banco (Agora com os dados já agrupados e somados implicitamente pela leitura sequencial)
  // Nota: Como limpamos a tabela por liga antes de inserir, a ordem dos arquivos (0 e 1) não importa tanto,
  // pois o ON CONFLICT fará o update se houver nomes repetidos DENTRO do mesmo batch de inserção?
  // NÃO: O ON CONFLICT só funciona dentro da mesma query de insert em lote. 
  // Como estamos fazendo loop, precisamos agregar manualmente se houver duplicatas nos CSVs.
  
  // Agregação manual para garantir soma correta caso o mesmo jogador apareça em 2 CSVs
  const aggregatePlayers = (list) => {
    const map = new Map();
    list.forEach(p => {
      if (map.has(p.name)) {
        const existing = map.get(p.name);
        // Soma jogos
        const oldGames = existing.games_played;
        const newGames = p.games_played;
        const totalGames = oldGames + newGames;

        // Soma stats absolutos (aproximado para KDA/Gold/etc baseando-se em jogos)
        // Média ponderada simples para manter consistência
        existing.games_played = totalGames;
        existing.kda = ((existing.kda * oldGames) + (p.kda * newGames)) / totalGames;
        existing.gold_per_min = ((existing.gold_per_min * oldGames) + (p.gold_per_min * newGames)) / totalGames;
        existing.dpm = ((existing.dpm * oldGames) + (p.dpm * newGames)) / totalGames;
        existing.cspm = ((existing.cspm * oldGames) + (p.cspm * newGames)) / totalGames;
        
        // Win% precisa ser recalculado se tivéssemos vitórias absolutas, mas como temos %, usamos média ponderada
        existing.win_percentage = ((existing.win_percentage * oldGames) + (p.win_percentage * newGames)) / totalGames;
        
        // Atualiza outros campos se o novo tiver valor
        if (p.team_name) existing.team_name = p.team_name;
        if (p.image_url) existing.image_url = p.image_url;
      } else {
        map.set(p.name, { ...p });
      }
    });
    return Array.from(map.values());
  };

  // Executar salvamento por liga
  for (const [league, players] of Object.entries(dataToProcess.players)) {
    const aggregated = aggregatePlayers(players);
    await savePlayersToDB(aggregated, league);
    console.log(`✅ Jogadores de ${league} processados (${aggregated.length} únicos).`);
  }

  for (const [league, teams] of Object.entries(dataToProcess.teams)) {
    // Agregação simples para times (soma de jogos/vitórias)
    const teamMap = new Map();
    teams.forEach(t => {
      if (teamMap.has(t.name)) {
        const ex = teamMap.get(t.name);
        ex.games_played += t.games_played;
        ex.wins += t.wins;
        ex.losses += t.losses;
      } else {
        teamMap.set(t.name, { ...t });
      }
    });
    await saveTeamsToDB(Array.from(teamMap.values()), league);
    console.log(`✅ Times de ${league} processados.`);
  }

  for (const [league, champs] of Object.entries(dataToProcess.champions)) {
    // Agregação para campeões
    const champMap = new Map();
    champs.forEach(c => {
      const key = `${c.champion_name}-${c.role}`;
      if (champMap.has(key)) {
        const ex = champMap.get(key);
        ex.games_played += c.games_played;
        ex.kills += c.kills;
        ex.deaths += c.deaths;
        ex.assists += c.assists;
        // Recalcular % seria ideal, mas soma direta de kills/deaths já ajuda
      } else {
        champMap.set(key, { ...c });
      }
    });
    await saveChampionStatsToDB(Array.from(champMap.values()), league);
    console.log(`✅ Campeões de ${league} processados.`);
  }

  console.log('\n🎉 Pipeline de extração concluído com sucesso!');
}

module.exports = { 
  runExtractionFromCSV,
  savePlayersToDB, 
  saveTeamsToDB, 
  saveChampionStatsToDB 
};

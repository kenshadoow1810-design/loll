require('dotenv').config();

const pool = require('../config/database');

const API_BASE_URL = 'https://api.citoapi.com/api/v1/lol/teams';

// Converter nome do time para slug da API
function convertToSlug(teamName) {
  return teamName
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Caso precise mapear alguns nomes específicos
const TEAM_NAME_MAPPINGS = {
    'RED Canids': 'red',
    'Movistar KOI': 'movistar',
    'ThunderTalk Gaming': 'thunder-talk-gaming',
    'LØS': 'los',
    'Ninjas in Pyjamas': 'ninjas',
    'Team Heretics': 'team-heretics',
    'Vivo Keyd Stars': 'vivo',
    'Fluxo W7M': 'fluxo',
    'Ultra Prime': 'ultra-prime',
    'GiantX': 'giant',
    'DN SOOPers': 'dn-soopers',
};

async function getTeamsFromDB() {
  const query = `
    SELECT DISTINCT name, league
    FROM teams
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getPlayersFromDB() {
  const query = `
    SELECT id, name, team_name, league
    FROM players
    WHERE team_name IS NOT NULL
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function fetchTeamRoster(teamSlug) {
  const token = process.env.CITO_API_TOKEN;

  if (!token) {
    console.error('❌ CITO_API_TOKEN não configurado no .env');
    throw new Error('API token not configured');
  }

  console.log(
    `  Token configurado: Sim (${token.substring(0, 5)}...)`
  );

  try {
    const url = `${API_BASE_URL}/${teamSlug}`;

    console.log(`  Fetching: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent': 'LoL-Stats-App/1.0'
      }
    });

    console.log(`  Status HTTP: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`    ⚠️ Time "${teamSlug}" não encontrado`);
        return null;
      }

      if (response.status === 429) {
        console.log(`    ⚠️ Rate limit atingido`);
        throw new Error('Rate limit exceeded');
      }

      const errorText = await response.text();

      console.log(`    ❌ Erro HTTP ${response.status}`);
      console.log(errorText);

      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      throw error;
    }

    console.error(
      `    ❌ Erro ao buscar ${teamSlug}:`,
      error.message
    );

    return null;
  }
}

async function updateImagesAndRealNames() {
  console.log('=== Iniciando atualização ===\n');

  try {
    // Buscar times
    const teams = await getTeamsFromDB();

    console.log(
      `Encontrados ${teams.length} times no banco\n`
    );

    // Buscar jogadores
    const players = await getPlayersFromDB();

    console.log(
      `Encontrados ${players.length} jogadores no banco\n`
    );

    // Agrupar jogadores por time+liga
    const playersByTeam = new Map();

    for (const player of players) {
      const key = `${player.team_name}-${player.league}`;

      if (!playersByTeam.has(key)) {
        playersByTeam.set(key, []);
      }

      playersByTeam.get(key).push(player);
    }

    let totalUpdated = 0;
    let totalSkipped = 0;
    let apiCallsCount = 0;

    const MAX_API_CALLS = 200;

    // Processar times
    for (const team of teams) {
      if (apiCallsCount >= MAX_API_CALLS) {
        console.log(
          `\n⚠️ Limite diário de ${MAX_API_CALLS} requisições atingido`
        );
        break;
      }

      const teamName = team.name;

      const teamSlug =
        TEAM_NAME_MAPPINGS[teamName] ||
        convertToSlug(teamName);

      console.log(
        `Processando time: ${teamName} (slug: ${teamSlug})`
      );

      // Buscar dados na API
      const rosterData = await fetchTeamRoster(teamSlug);

      if (!rosterData || !rosterData.roster) {
        console.log(
          `  ⚠️ Sem roster para ${teamName}\n`
        );
        continue;
      }

      // Atualizar logo do time
      const logoUrl = rosterData.logoUrl || null;

      if (logoUrl) {
        const updateTeamQuery = `
          UPDATE teams
          SET logo_url = $1,
              updated_at = NOW()
          WHERE name = $2
            AND league = $3
        `;

        await pool.query(updateTeamQuery, [
          logoUrl,
          teamName,
          team.league
        ]);

        console.log(`  ✅ Logo atualizada`);
      }

      // Jogadores da API
      const apiPlayers = rosterData.roster || [];

      console.log(
        `  Jogadores encontrados: ${apiPlayers.length}`
      );

      // Jogadores do banco desse time
      const teamPlayers =
        playersByTeam.get(
          `${teamName}-${team.league}`
        ) || [];

      for (const apiPlayer of apiPlayers) {
        const apiPlayerName =
          apiPlayer.playerName?.trim();

        if (!apiPlayerName) {
          continue;
        }

        // Buscar jogador correspondente
        const dbPlayer = teamPlayers.find(
          p =>
            p.name?.trim().toLowerCase() ===
            apiPlayerName.toLowerCase()
        );

        if (!dbPlayer) {
          console.log(
            `    ⏭️ ${apiPlayerName} não encontrado no banco`
          );

          totalSkipped++;
          continue;
        }

        // Dados do jogador
        const imageUrl =
          apiPlayer.imageUrl ||
          apiPlayer.player?.imageUrl ||
          null;

        const realName =
          apiPlayer.player?.realName ||
          null;

        // Atualizar jogador
        const updatePlayerQuery = `
          UPDATE players
          SET image_url = COALESCE($1, image_url),
              real_name = COALESCE($2, real_name),
              updated_at = NOW()
          WHERE id = $3
        `;

        await pool.query(updatePlayerQuery, [
          imageUrl,
          realName,
          dbPlayer.id
        ]);

        console.log(
          `    ✅ ${apiPlayerName} atualizado`
        );

        console.log(
          `       Foto: ${imageUrl ? 'Sim' : 'Não'}`
        );

        console.log(
          `       Nome real: ${realName || 'Não'}`
        );

        totalUpdated++;
      }

      apiCallsCount++;

      console.log(
        `  Requisições usadas: ${apiCallsCount}/${MAX_API_CALLS}\n`
      );

      // Delay para evitar rate limit
      if (apiCallsCount < MAX_API_CALLS) {
        await new Promise(resolve =>
          setTimeout(resolve, 500)
        );
      }
    }

    console.log('\n=== RESUMO ===');

    console.log(
      `Jogadores atualizados: ${totalUpdated}`
    );

    console.log(
      `Jogadores ignorados: ${totalSkipped}`
    );

    console.log(
      `Requisições usadas: ${apiCallsCount}`
    );

    console.log('\n=== Finalizado ===');
  } catch (error) {
    console.error('\n❌ Erro geral:', error);

    throw error;
  }
}

// Executar diretamente
if (require.main === module) {
  updateImagesAndRealNames()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

module.exports = {
  updateImagesAndRealNames
};

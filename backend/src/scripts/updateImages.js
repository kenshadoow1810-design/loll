require('dotenv').config();
const pool = require('../config/database');  	

const API_BASE_URL = 'https://api.citoapi.com/api/v1/lol/teams';

// Converter nome do time para slug da API
function convertToSlug(teamName) {
  return teamName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Mapeamento especial de nomes de times que não seguem o padrão
const TEAM_NAME_MAPPINGS = {
  'loud': 'loud',
  'paiNGaming': 'pain-gaming',
  'paiN': 'pain-gaming',
  'KaBuM!': 'kabum',
  'KaBuM': 'kabum',
  'kabum': 'kabum',
  'FURIA': 'furia',
  'Flamengo': 'flamengo',
  'REDCanids': 'red-canids',
  'RED': 'red-canids',
  'INTZ': 'intz',
  'Liberty': 'liberty',
  'VivoKeyd': 'vivo-keyd',
  'VK': 'vivo-keyd',
  'MovistarR7': 'movistar-r7',
  'Isurus': 'isurus',
  'Leviatan': 'leviatan',
  'Estral': 'estral',
  'Rainbow7': 'rainbow7',
  'AllKnights': 'all-knights',
  'Infinity': 'infinity',
  'TeamAze': 'team-aze',
  'LosGrande': 'los-grande',
  'Cloud9': 'cloud9',
  'TeamLiquid': 'team-liquid',
  'TSM': 'tsm',
  '100Thieves': '100-thieves',
  'FlyQuest': 'flyquest',
  'Dignitas': 'dignitas',
  'Immortals': 'immortals',
  'NRG': 'nrg',
  'GoldenGuardians': 'golden-guardians',
  'ShopifyRebellion': 'shopify-rebellion',
  'T1': 't1',
  'Gen.G': 'gen-g',
  'DRX': 'drx',
  'KT Rolster': 'kt-rolster',
  'HanwhaLifeEsports': 'hanwha-life-esports',
  'DWGKIA': 'dwg-kia',
  'DK': 'dwg-kia',
  'DplusKIA': 'dwg-kia',
  'KDF': 'kwangdong-freecs',
  'KwangdongFreecs': 'kwangdong-freecs',
  'NongshimRedForce': 'nongshim-red-force',
  'NS': 'nongshim-red-force',
  'BRO': 'brion',
  'OKBrion': 'brion',
  'LiivSANDBOX': 'liiv-sandbox',
  'LSB': 'liiv-sandbox',
  'G2 Esports': 'g2-esports',
  'G2': 'g2-esports',
  'Fnatic': 'fnatic',
  'MAD Lions': 'mad-lions',
  'MAD': 'mad-lions',
  'Team Vitality': 'team-vitality',
  'Vitality': 'team-vitality',
  'SK Gaming': 'sk-gaming',
  'SK': 'sk-gaming',
  'Excel Esports': 'excel-esports',
  'Excel': 'excel-esports',
  'Rogue': 'rogue',
  'Astralis': 'astralis',
  'Team BDS': 'team-bds',
  'BDS': 'team-bds',
  'KOI': 'koi',
  'Giants Gaming': 'giants-gaming',
  'Giants': 'giants-gaming',
  'JD Gaming': 'jd-gaming',
  'JDG': 'jd-gaming',
  'Bilibili Gaming': 'bilibili-gaming',
  'BLG': 'bilibili-gaming',
  'Top Esports': 'top-esports',
  'TES': 'top-esports',
  'LNG Esports': 'lng-esports',
  'LNG': 'lng-esports',
  'Weibo Gaming': 'weibo-gaming',
  'WBG': 'weibo-gaming',
  'Invictus Gaming': 'invictus-gaming',
  'IG': 'invictus-gaming',
  'EDward Gaming': 'edward-gaming',
  'EDG': 'edward-gaming',
  'FunPlus Phoenix': 'funplus-phoenix',
  'FPX': 'funplus-phoenix',
  'Royal Never Give Up': 'royal-never-give-up',
  'RNG': 'royal-never-give-up'
};

async function getTeamsFromDB() {
  const query = 'SELECT DISTINCT name, league FROM teams';
  const result = await pool.query(query);
  return result.rows;
}

async function getPlayersFromDB() {
	const query = 'SELECT id, name, team_name, league FROM players WHERE team_name IS NOT NULL';
  const result = await pool.query(query);
  return result.rows;
}

async function fetchTeamRoster(teamSlug) {
  const token = process.env.CITO_API_TOKEN;
  if (!token) {
    console.error('❌ CITO_API_TOKEN não configurado no .env');
    throw new Error('API token not configured');
  }

   	  // Debug: mostrar se o token está sendo lido (apenas primeiros caracteres)
   	  console.log(`  Token configurado: ${token ? 'Sim (inicia com: ' + token.substring(0, 5) + '...)' : 'Não'}`);

  try {
    const url = `${API_BASE_URL}/${teamSlug}`;
    console.log(`  Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'LoL-Stats-App/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`    ⚠️ Time "${teamSlug}" não encontrado na API`);
        return null;
      }
      if (response.status === 429) {
        console.log(`    ⚠️ Limite de requisições atingido`);
        throw new Error('Rate limit exceeded');
      }
      console.log(`    ⚠️ Erro HTTP ${response.status} para ${teamSlug}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      throw error;
    }
    console.error(`    ❌ Erro ao buscar ${teamSlug}:`, error.message);
    return null;
  }
}

async function updateImagesAndRealNames() {
  console.log('=== Iniciando atualização de imagens e nomes reais ===\n');

  try {
    // Buscar todos os times do banco
    const teams = await getTeamsFromDB();
    console.log(`Encontrados ${teams.length} times no banco de dados\n`);

    // Buscar todos os jogadores do banco
    const players = await getPlayersFromDB();
    console.log(`Encontrados ${players.length} jogadores no banco de dados\n`);

    // Criar mapa de jogadores por time para facilitar busca
    const playersByTeam = new Map();
    for (const player of players) {
      const teamKey = `${player.team_name || ''}-${player.league}`;
      if (!playersByTeam.has(teamKey)) {
        playersByTeam.set(teamKey, []);
      }
      playersByTeam.get(teamKey).push(player);
    }

    let totalUpdated = 0;
    let totalSkipped = 0;
    let apiCallsCount = 0;
    const MAX_API_CALLS = 200; // Limite diário da API

    // Processar cada time
    for (const team of teams) {
      if (apiCallsCount >= MAX_API_CALLS) {
        console.log(`\n⚠️ Limite de ${MAX_API_CALLS} requisições diárias atingido!`);
        break;
      }

      const teamName = team.name;

      // Tentar encontrar o slug usando mapeamento ou conversão direta
      let teamSlug = TEAM_NAME_MAPPINGS[teamName] || convertToSlug(teamName);

      console.log(`Processando time: ${teamName} (slug: ${teamSlug})`);

      // Buscar roster na API
      const rosterData = await fetchTeamRoster(teamSlug);

      if (!rosterData || !rosterData.players) {
        console.log(`  ⚠️ Sem dados de jogadores para ${teamName}\n`);
        continue;
      }

      const logoUrl = rosterData.logoUrl || null;

      // Atualizar logo do time
      if (logoUrl) {
        const updateTeamQuery = `
          UPDATE teams
          SET logo_url = $1, updated_at = NOW()
          WHERE name = $2 AND league = $3
        `;
        await pool.query(updateTeamQuery, [logoUrl, teamName, team.league]);
        console.log(`  ✅ Logo atualizada para ${teamName}`);
      }

      // Processar jogadores do roster
      const apiPlayers = rosterData.players || [];
      console.log(`  Jogadores encontrados na API: ${apiPlayers.length}`);

      // Obter jogadores deste time no banco
      const teamPlayers = playersByTeam.get(`${teamName}-${team.league}`) || [];

      for (const apiPlayer of apiPlayers) {
        const apiPlayerName = apiPlayer.playerName;

        if (!apiPlayerName) {
          continue;
        }

        // Procurar jogador correspondente no banco
        const dbPlayer = teamPlayers.find(p => p.name === apiPlayerName);

        if (dbPlayer) {
          // Jogador encontrado no banco - atualizar dados
          const imageUrl = apiPlayer.imageUrl || null;
          const realName = apiPlayer.realName || null;

          const updatePlayerQuery = `
            UPDATE players
            SET image_url = COALESCE($1, image_url),
                real_name = COALESCE($2, real_name),
                updated_at = NOW()
            WHERE id = $3
          `;

          await pool.query(updatePlayerQuery, [imageUrl, realName, dbPlayer.id]);

          if (imageUrl || realName) {
            console.log(`    ✅ ${apiPlayerName} atualizado (img: ${imageUrl ? 'sim' : 'não'}, real: ${realName ? realName : 'não'})`);
            totalUpdated++;
          } else {
            totalSkipped++;
          }
        } else {
          // Jogador não está no banco - skip
          console.log(`    ⏭️ ${apiPlayerName} skipado (não está no banco)`);
          totalSkipped++;
        }
      }

      apiCallsCount++;
      console.log(`  Requisições usadas: ${apiCallsCount}/${MAX_API_CALLS}\n`);

      // Pequeno delay para evitar rate limit
      if (apiCallsCount < MAX_API_CALLS) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n=== Resumo ===');
    console.log(`Jogadores atualizados: ${totalUpdated}`);
    console.log(`Jogadores skipados: ${totalSkipped}`);
    console.log(`Requisições à API: ${apiCallsCount}`);
    console.log('\n=== Atualização concluída ===');

  } catch (error) {
    console.error('Erro na atualização:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateImagesAndRealNames()
    .then(() => {
      console.log('Script finalizado com sucesso');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Script falhou:', err);
      process.exit(1);
    });
}

module.exports = { updateImagesAndRealNames };

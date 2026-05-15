import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITO_BASE_URL = 'https://api.citoapi.com/api/v1/lol';
const API_KEY = process.env.CITO_API_KEY;
// Ligas e regiões permitidas baseadas nos dados retornados pela API
const ALLOWED_LEAGUES = ['LCK', 'LPL', 'LCS', 'LEC', 'CBLOL'];
const ALLOWED_REGIONS = ['KOREA', 'CHINA', 'AMERICAS', 'EMEA', 'BRAZIL'];
const ALLOWED_SLUGS = ['lck', 'lpl', 'lcs', 'lec', 'cblol', 'lta', 'lta_n', 'lta_s'];

// Agente HTTPS que ignora erros de certificado SSL (apenas para desenvolvimento)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

console.log('🔍 Verificando configuração...');
if (!API_KEY) {
  console.error('❌ ERRO: CITO_API_KEY não configurada!');
  console.error('📝 Crie um arquivo .env na raiz do backend com:');
  console.error('   CITO_API_KEY=sua_chave_aqui');
  console.error('💡 Obtenha sua chave em: https://citoapi.com/');
  process.exit(1);
}
console.log(`✅ API Key configurada (iniciando com ${API_KEY.substring(0, 8)}...)`);

const apiClient = axios.create({
  baseURL: CITO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  httpsAgent: httpsAgent
});

async function fetchTeamsFromAPI() {
  try {
    if (!API_KEY) {
      console.error('❌ CITO_API_KEY não configurada. Verifique o arquivo .env');
      throw new Error('API Key não configurada');
    }
    console.log('🔑 Buscando times da Cito API...');
    
    let allTeams = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await apiClient.get('/teams', {
        params: { page, limit: 100 }
      });
      console.log(`📥 Página ${page} - Status: ${response.status}`);
      
      let responseData = response.data;
      
      // Extrair array de teams e verificar se há mais páginas
      if (responseData.teams && Array.isArray(responseData.teams)) {
        const teamsPage = responseData.teams;
        allTeams = allTeams.concat(teamsPage);
        console.log(`   ↳ ${teamsPage.length} times na página ${page}`);
        hasMore = responseData.hasMore === true || (responseData.total && allTeams.length < responseData.total);
      } else if (Array.isArray(responseData)) {
        allTeams = allTeams.concat(responseData);
        console.log(`   ↳ ${responseData.length} times na página ${page}`);
        hasMore = false; // Se for array direto, assume que não tem paginação
      } else {
        console.error('❌ Estrutura de dados inesperada:', JSON.stringify(responseData, null, 2));
        throw new Error('Formato de dados da API desconhecido');
      }
      
      if (hasMore) page++;
    }

    console.log(`📦 Total de times recebidos: ${allTeams.length}`);
    
    // Debug: Mostrar estrutura do primeiro time para entender os campos
    if (allTeams.length > 0) {
      console.log('🔍 Estrutura do primeiro time:', JSON.stringify(allTeams[0], null, 2));
    }
    
    const filteredTeams = allTeams.filter(team => {
      // Verificar se o time tem ligas no formato retornado pela API
      if (team.leagues && Array.isArray(team.leagues) && team.leagues.length > 0) {
        const allowedSlugs = ['lck', 'lpl', 'lcs', 'lec', 'cblol', 'lta', 'lta_n', 'lta_s'];
        const hasAllowedLeague = team.leagues.some(league => {
          const slug = league.slug?.toLowerCase();
          return allowedSlugs.includes(slug);
        });
        
        if (!hasAllowedLeague) {
          const leagueNames = team.leagues.map(l => `${l.name} (${l.slug})`).join(', ');
          console.log(`⚠️ Ligas "${leagueNames}" não permitidas para time: ${team.name}`);
        } else {
          // Log dos times que PASSARAM no filtro
          const allowedLeagues = team.leagues
            .filter(l => allowedSlugs.includes(l.slug?.toLowerCase()))
            .map(l => l.name)
            .join(', ');
          console.log(`✅ Time permitido: ${team.name} - Ligas: ${allowedLeagues}`);
        }
        
        return hasAllowedLeague;
      }
      
      // Fallback para outras propriedades
      const teamLeague = team.league || team.region || team.tournament;
      if (!teamLeague) {
        console.log('⚠️ Time sem liga:', team.name || team.code || team.id);
        return false;
      }
      
      const normalizedTeamLeague = teamLeague.toUpperCase().replace(/[\s\.-]+/g, '');
      const isAllowed = ALLOWED_LEAGUES.some(allowed => 
        normalizedTeamLeague.includes(allowed.replace(/[\s\.-]+/g, ''))
      );
      if (!isAllowed) {
        console.log(`⚠️ Liga "${teamLeague}" não permitida para time: ${team.name || team.code}`);
      }
      return isAllowed;
    });
    
    console.log(`📦 Times após filtro: ${filteredTeams.length}`);
    return filteredTeams;
  } catch (error) {
    console.error('❌ Erro ao buscar times da Cito API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function fetchPlayersFromAPI() {
  try {
    if (!API_KEY) {
      console.error('❌ CITO_API_KEY não configurada. Verifique o arquivo .env');
      throw new Error('API Key não configurada');
    }
    console.log('🔑 Buscando jogadores da Cito API...');
    
    let allPlayers = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await apiClient.get('/players', {
        params: { page, limit: 100 }
      });
      console.log(`📥 Página ${page} - Status: ${response.status}`);
      
      let responseData = response.data;
      
      // Extrair array de players e verificar se há mais páginas
      if (responseData.players && Array.isArray(responseData.players)) {
        const playersPage = responseData.players;
        allPlayers = allPlayers.concat(playersPage);
        console.log(`   ↳ ${playersPage.length} jogadores na página ${page}`);
        hasMore = responseData.hasMore === true || (responseData.total && allPlayers.length < responseData.total);
      } else if (Array.isArray(responseData)) {
        allPlayers = allPlayers.concat(responseData);
        console.log(`   ↳ ${responseData.length} jogadores na página ${page}`);
        hasMore = false; // Se for array direto, assume que não tem paginação
      } else {
        console.error('❌ Estrutura de dados inesperada:', JSON.stringify(responseData, null, 2));
        throw new Error('Formato de dados da API desconhecido');
      }
      
      if (hasMore) page++;
    }

    console.log(`📦 Total de jogadores recebidos: ${allPlayers.length}`);
    
    // Debug: Mostrar estrutura do primeiro jogador para entender os campos
    if (allPlayers.length > 0) {
      console.log('🔍 Estrutura do primeiro jogador:', JSON.stringify(allPlayers[0], null, 2));
    }
    
    const filteredPlayers = allPlayers.filter(player => {
      // Verificar se o jogador tem ligas através do time ou diretamente
      if (player.team && player.team.leagues && Array.isArray(player.team.leagues) && player.team.leagues.length > 0) {
        const allowedSlugs = ['lck', 'lpl', 'lcs', 'lec', 'cblol', 'lta', 'lta_n', 'lta_s'];
        const hasAllowedLeague = player.team.leagues.some(league => {
          const slug = league.slug?.toLowerCase();
          return allowedSlugs.includes(slug);
        });
        
        if (!hasAllowedLeague) {
          const leagueNames = player.team.leagues.map(l => `${l.name} (${l.slug})`).join(', ');
          console.log(`⚠️ Ligas "${leagueNames}" não permitidas para jogador: ${player.currentIgn || player.realName}`);
        } else {
          // Log dos jogadores que PASSARAM no filtro
          const allowedLeagues = player.team.leagues
            .filter(l => allowedSlugs.includes(l.slug?.toLowerCase()))
            .map(l => l.name)
            .join(', ');
          console.log(`✅ Jogador permitido: ${player.currentIgn || player.realName} - Time: ${player.currentTeam} - Ligas: ${allowedLeagues}`);
        }
        
        return hasAllowedLeague;
      }
      
      // Fallback para outras propriedades
      const playerLeague = player.league || player.team?.league || player.region;
      if (!playerLeague) {
        console.log('⚠️ Jogador sem liga:', player.currentIgn || player.realName || player.id);
        return false;
      }
      
      const normalizedPlayerLeague = playerLeague.toUpperCase().replace(/[\s\.-]+/g, '');
      const isAllowed = ALLOWED_LEAGUES.some(allowed => 
        normalizedPlayerLeague.includes(allowed.replace(/[\s\.-]+/g, ''))
      );
      if (!isAllowed) {
        console.log(`⚠️ Liga "${playerLeague}" não permitida para jogador: ${player.currentIgn || player.realName}`);
      }
      return isAllowed;
    });
    
    console.log(`📦 Jogadores após filtro: ${filteredPlayers.length}`);
    return filteredPlayers;
  } catch (error) {
    console.error('❌ Erro ao buscar jogadores da Cito API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    const dbName = process.env.DB_NAME || 'prostats_lol';
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📁 Criando banco de dados: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`✅ Banco de dados ${dbName} já existe`);
    }

    await client.end();

    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await dbClient.connect();
    console.log(`✅ Conectado ao banco ${dbName}`);

    const schemaPath = path.join(__dirname, '../../data/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    console.log('📄 Executando schema.sql...');
    await dbClient.query(schemaSQL);
    console.log('✅ Schema criado com sucesso');

    console.log('🔄 Iniciando sincronização com Cito API...');
    
    console.log('\n📡 Times:');
    const teams = await fetchTeamsFromAPI();
    console.log(`📦 ${teams.length} times encontrados na API`);

    if (teams.length > 0) {
      for (const team of teams) {
        await dbClient.query(
          `INSERT INTO teams (external_id, name, code, logo_url, league, region, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (external_id) DO UPDATE SET
             name = EXCLUDED.name,
             code = EXCLUDED.code,
             logo_url = EXCLUDED.logo_url,
             league = EXCLUDED.league,
             region = EXCLUDED.region,
             updated_at = NOW()`,
          [team.id, team.name, team.code, team.logo, team.league, team.region]
        );
      }
      console.log(`✅ Times sincronizados: ${teams.length}`);
    } else {
      console.log('⚠️  Nenhum time encontrado para sincronizar');
    }

    console.log('\n📡 Jogadores:');
    const players = await fetchPlayersFromAPI();
    console.log(`📦 ${players.length} jogadores encontrados na API`);

    if (players.length > 0) {
      for (const player of players) {
        let teamId = null;
        if (player.team && player.team.name) {
          const teamResult = await dbClient.query(
            'SELECT id FROM teams WHERE external_id = $1 OR name = $2',
            [player.team.id, player.team.name]
          );
          if (teamResult.rows.length > 0) {
            teamId = teamResult.rows[0].id;
          }
        }

        await dbClient.query(
          `INSERT INTO players (external_id, name, real_name, role, photo_url, team_id, league, region, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           ON CONFLICT (external_id) DO UPDATE SET
             name = EXCLUDED.name,
             real_name = EXCLUDED.real_name,
             role = EXCLUDED.role,
             photo_url = EXCLUDED.photo_url,
             team_id = EXCLUDED.team_id,
             league = EXCLUDED.league,
             region = EXCLUDED.region,
             updated_at = NOW()`,
          [player.id, player.name, player.realName, player.role, player.photo, teamId, player.league, player.region]
        );
      }
      console.log(`✅ Jogadores sincronizados: ${players.length}`);
    } else {
      console.log('⚠️  Nenhum jogador encontrado para sincronizar');
    }

    const teamsCount = await dbClient.query('SELECT COUNT(*) FROM teams');
    const playersCount = await dbClient.query('SELECT COUNT(*) FROM players');

    console.log('\n📊 Resumo da inicialização:');
    console.log(`   - Times: ${teamsCount.rows[0].count}`);
    console.log(`   - Jogadores: ${playersCount.rows[0].count}`);

    await dbClient.end();
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase();

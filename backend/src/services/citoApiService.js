const axios = require('axios');

const CITO_BASE_URL = 'https://api.citoapi.com/api/v1/lol';
const API_KEY = process.env.CITO_API_KEY;

// Ligas permitidas (IDs ou nomes conforme retorno da API)
// Vamos precisar ajustar esses IDs/nomes após vermos a resposta real da API
const ALLOWED_LEAGUES = ['LCK', 'LPL', 'LCS', 'LEC', 'CBLOL'];

const apiClient = axios.create({
  baseURL: CITO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Busca todos os times da API externa
 * @returns {Promise<Array>} Lista de times filtrada pelas ligas permitidas
 */
async function fetchTeams() {
  try {
    const response = await apiClient.get('/teams');
    const allTeams = response.data;

    // Filtra apenas times das ligas permitidas
    // Ajuste a propriedade 'league' conforme a estrutura real do JSON da Cito
    return allTeams.filter(team => {
      // Supondo que o time tenha uma propriedade 'league' ou 'region'
      // Precisaremos validar o nome exato do campo quando testarmos
      const teamLeague = team.league || team.region || team.tournament; 
      if (!teamLeague) return false;
      
      // Verifica se a liga do time está na lista de permitidas
      // Fazemos uma comparação case-insensitive e removendo espaços
      const normalizedTeamLeague = teamLeague.toUpperCase().replace(/\s+/g, '');
      return ALLOWED_LEAGUES.some(allowed => 
        normalizedTeamLeague.includes(allowed.replace(/\s+/g, ''))
      );
    });
  } catch (error) {
    console.error('Erro ao buscar times da Cito API:', error.message);
    throw error;
  }
}

/**
 * Busca todos os jogadores da API externa
 * @returns {Promise<Array>} Lista de jogadores filtrada pelas ligas permitidas
 */
async function fetchPlayers() {
  try {
    const response = await apiClient.get('/players');
    const allPlayers = response.data;

    // Filtra apenas jogadores das ligas permitidas
    // Geralmente o jogador tem uma referência ao time ou à liga
    return allPlayers.filter(player => {
      const playerLeague = player.league || player.team?.league || player.region;
      if (!playerLeague) return false;

      const normalizedPlayerLeague = playerLeague.toUpperCase().replace(/\s+/g, '');
      return ALLOWED_LEAGUES.some(allowed => 
        normalizedPlayerLeague.includes(allowed.replace(/\s+/g, ''))
      );
    });
  } catch (error) {
    console.error('Erro ao buscar jogadores da Cito API:', error.message);
    throw error;
  }
}

/**
 * Busca o calendário de partidas da semana
 * @returns {Promise<Array>} Lista de partidas
 */
async function fetchSchedule() {
  try {
    const response = await apiClient.get('/schedule/week');
    const allMatches = response.data;

    // Filtra partidas apenas das ligas permitidas
    return allMatches.filter(match => {
      const matchLeague = match.league || match.tournament || match.region;
      if (!matchLeague) return false;

      const normalizedMatchLeague = matchLeague.toUpperCase().replace(/\s+/g, '');
      return ALLOWED_LEAGUES.some(allowed => 
        normalizedMatchLeague.includes(allowed.replace(/\s+/g, ''))
      );
    });
  } catch (error) {
    console.error('Erro ao buscar calendário da Cito API:', error.message);
    throw error;
  }
}

module.exports = {
  fetchTeams,
  fetchPlayers,
  fetchSchedule
};

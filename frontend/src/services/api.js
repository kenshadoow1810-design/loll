const API_BASE_URL =   import.meta.env.VITE_API_URL;

export const api = {

  getRankings: async (league) => {
    const response = await fetch(`${API_BASE_URL}/api/players/${league}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rankings');
    }
    return await response.json();
  },

  getRankingsAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/players`);
    if (!response.ok) {
      throw new Error('Failed to fetch all rankings');
    }
    return await response.json();
  },

  getTotalPlayersCount: async () => {
    const response = await fetch(`${API_BASE_URL}/api/total-players`);
    if (!response.ok) {
      throw new Error('Failed to fetch total players count');
    }
    return await response.json();
  },

  getLastUpdateTime: async () => {
    const response = await fetch(`${API_BASE_URL}/api/last-update`);
    if (!response.ok) {
      throw new Error('Failed to fetch last update time');
    }
    return await response.json();
  },

  getPlayer: async (playerId, league) => {
    const response = await fetch(`${API_BASE_URL}/api/player/${playerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player');
    }
    return await response.json();
  },

  getAllPlayers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/players`);
    if (!response.ok) {
      throw new Error('Failed to fetch all players');
    }
    return await response.json();
  },

  getTopPlayers: async (count = 8) => {
    const allPlayers = await api.getAllPlayers();
    return allPlayers.sort((a, b) => b.kda - a.kda).slice(0, count);
  },

  getTeams: async () => {
    const response = await fetch(`${API_BASE_URL}/api/teams`);
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return await response.json();
  },

  getTeamsByLeague: async (league) => {
    const response = await fetch(`${API_BASE_URL}/api/teams/${league}`);
    if (!response.ok) {
      throw new Error('Failed to fetch teams by league');
    }
    return await response.json();
  },

  getTeamById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/team/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team');
    }
    return await response.json();
  },

  getChampionStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/champions`);
    if (!response.ok) {
      throw new Error('Failed to fetch champion stats');
    }
    return await response.json();
  },
};

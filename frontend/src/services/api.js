const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Get rankings by league
  getRankings: async (league) => {
    const response = await fetch(`${API_BASE_URL}/players/${league}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rankings');
    }
    return await response.json();
  },

  // Get player by ID
  getPlayer: async (playerId, league) => {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player');
    }
    return await response.json();
  },

  // Get all players for search
  getAllPlayers: async () => {
    const response = await fetch(`${API_BASE_URL}/players`);
    if (!response.ok) {
      throw new Error('Failed to fetch all players');
    }
    return await response.json();
  },

  // Get top players (usa getAllPlayers e ordena no frontend)
  getTopPlayers: async (count = 8) => {
    const allPlayers = await api.getAllPlayers();
    return allPlayers.sort((a, b) => b.kda - a.kda).slice(0, count);
  },

  // Get champion statistics (will be populated when champion links are provided)
  getChampionStats: async () => {
    const response = await fetch(`${API_BASE_URL}/champions`);
    if (!response.ok) {
      throw new Error('Failed to fetch champion stats');
    }
    return await response.json();
  },
};

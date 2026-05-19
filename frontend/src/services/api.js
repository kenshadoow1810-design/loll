const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock data fallback para outras funcionalidades
import { PLAYERS, getAllPlayers, getTopPlayers, getPlayerById } from '../data/mockData';

export const api = {
  // Get rankings by league
  getRankings: async (league) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return PLAYERS[league] || [];
  },

  // Get player by ID
  getPlayer: async (playerId, league) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getPlayerById(playerId, league);
  },

  // Get all players for search
  getAllPlayers: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getAllPlayers();
  },

  // Get top players
  getTopPlayers: async (count = 8) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getTopPlayers(count);
  },
};

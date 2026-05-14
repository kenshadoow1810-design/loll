const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock data fallback
import { PLAYERS, MATCHES, NEWS, getAllPlayers, getTopPlayers, getPlayerById, generateMatch } from '../data/mockData';

export const api = {
  // Get rankings by league
  getRankings: async (league) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return PLAYERS[league] || [];
  },

  // Get player by ID
  getPlayer: async (playerId, league) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getPlayerById(playerId, league);
  },

  // Get player matches
  getPlayerMatches: async (playerId, league) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const player = getPlayerById(playerId, league);
    if (!player) return [];
    return Array.from({ length: 5 }, () => generateMatch(player));
  },

  // Get all players for search
  getAllPlayers: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getAllPlayers();
  },

  // Get news
  getNews: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NEWS;
  },

  // Get recent matches
  getRecentMatches: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getAllPlayers()
      .slice(0, 25)
      .flatMap(p => Array.from({ length: 2 }, () => generateMatch(p)))
      .sort((a, b) => b.timeAgo - a.timeAgo)
      .slice(0, 20);
  },

  // Get top players
  getTopPlayers: async (count = 8) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getTopPlayers(count);
  },
};

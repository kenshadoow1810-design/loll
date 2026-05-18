const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock data fallback para outras funcionalidades
import { PLAYERS, MATCHES, NEWS, getAllPlayers, getTopPlayers, getPlayerById, generateMatch } from '../data/mockData';

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

  // Get news from backend RSS feed
  getNews: async (category = null) => {
    try {
      const url = category 
        ? `${API_BASE_URL}/news?category=${category}` 
        : `${API_BASE_URL}/news`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Erro ao buscar notícias');
      }
    } catch (error) {
      console.error('Erro na API de notícias:', error);
      // Fallback para dados mockados em caso de erro
      return NEWS;
    }
  },

  // Get available news categories
  getNewsCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/categories`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [
        { id: 'all', name: 'Todas' },
        { id: 'cblol', name: 'CBLOL' },
        { id: 'lck', name: 'LCK' },
        { id: 'lpl', name: 'LPL' },
        { id: 'lec', name: 'LEC' },
        { id: 'lcs', name: 'LCS' },
      ];
    }
  },

  // Get news content for internal display
  getNewsContent: async (url) => {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`${API_BASE_URL}/news/content?url=${encodedUrl}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Erro ao buscar conteúdo da notícia');
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo da notícia:', error);
      throw error;
    }
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

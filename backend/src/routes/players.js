const express = require('express');
const PlayerService = require('../services/playerService');
const MatchService = require('../services/matchService');
const { getCache, setCache } = require('../middleware/cache');

const router = express.Router();

/**
 * GET /api/players/search?q=name
 * Search players by name
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const cacheKey = `players_search_${q}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const players = await PlayerService.searchPlayers(q, parseInt(limit));
    setCache(cacheKey, players, 300); // Cache for 5 minutes
    
    res.json(players);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

/**
 * GET /api/players/:id
 * Get player by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `player_${id}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const player = await PlayerService.getPlayerById(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    setCache(cacheKey, player, 600); // Cache for 10 minutes
    
    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/**
 * GET /api/players/name/:name
 * Get player by name
 */
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const cacheKey = `player_name_${name}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const player = await PlayerService.getPlayerByName(name);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    setCache(cacheKey, player, 600); // Cache for 10 minutes
    
    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/**
 * GET /api/players/top
 * Get top players by league points
 */
router.get('/top', async (req, res) => {
  try {
    const { region, limit = 50 } = req.query;
    
    const cacheKey = `players_top_${region || 'all'}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const players = await PlayerService.getTopPlayers(region || null, parseInt(limit));
    setCache(cacheKey, players, 300); // Cache for 5 minutes
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching top players:', error);
    res.status(500).json({ error: 'Failed to fetch top players' });
  }
});

/**
 * GET /api/players/region/:region
 * Get players by region
 */
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 100 } = req.query;
    
    const cacheKey = `players_region_${region}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const players = await PlayerService.getPlayersByRegion(region, parseInt(limit));
    setCache(cacheKey, players, 300); // Cache for 5 minutes
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching players by region:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

/**
 * GET /api/players/:id/stats
 * Get player statistics
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `player_stats_${id}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const stats = await PlayerService.getPlayerStats(id);
    setCache(cacheKey, stats, 600); // Cache for 10 minutes
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

/**
 * GET /api/players/:id/champions
 * Get player's champion statistics
 */
router.get('/:id/champions', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const cacheKey = `player_champions_${id}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const champions = await PlayerService.getPlayerChampionStats(id, parseInt(limit));
    setCache(cacheKey, champions, 600); // Cache for 10 minutes
    
    res.json(champions);
  } catch (error) {
    console.error('Error fetching player champion stats:', error);
    res.status(500).json({ error: 'Failed to fetch champion stats' });
  }
});

/**
 * GET /api/players/:id/matches
 * Get player's match history
 */
router.get('/:id/matches', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const cacheKey = `player_matches_${id}_${limit}_${offset}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const matches = await MatchService.getMatchesByPlayerId(
      parseInt(id), 
      parseInt(limit), 
      parseInt(offset)
    );
    setCache(cacheKey, matches, 300); // Cache for 5 minutes
    
    res.json(matches);
  } catch (error) {
    console.error('Error fetching player matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

module.exports = router;

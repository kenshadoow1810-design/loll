const express = require('express');
const DataSyncService = require('../services/dataSyncService');
const CronJobsService = require('../cron/jobs');
const PlayerService = require('../services/playerService');
const { getCache, setCache, clearCache, getCacheStats } = require('../middleware/cache');

const router = express.Router();

/**
 * POST /api/sync/player
 * Sync a single player by summoner name
 */
router.post('/player', async (req, res) => {
  try {
    const { summonerName, region = 'br1' } = req.body;
    
    if (!summonerName) {
      return res.status(400).json({ error: 'summonerName is required' });
    }
    
    const player = await DataSyncService.syncPlayerData(summonerName, region);
    
    res.json({ 
      success: true, 
      message: 'Player synced successfully',
      player 
    });
  } catch (error) {
    console.error('Error syncing player:', error);
    res.status(500).json({ 
      error: 'Failed to sync player',
      details: error.message 
    });
  }
});

/**
 * POST /api/sync/matches
 * Sync matches for a player
 */
router.post('/matches', async (req, res) => {
  try {
    const { puuid, playerId, region = 'br1', count = 20 } = req.body;
    
    if (!puuid || !playerId) {
      return res.status(400).json({ error: 'puuid and playerId are required' });
    }
    
    const newMatchesCount = await DataSyncService.syncPlayerMatches(puuid, playerId, region, count);
    
    res.json({ 
      success: true, 
      message: 'Matches synced successfully',
      newMatchesCount 
    });
  } catch (error) {
    console.error('Error syncing matches:', error);
    res.status(500).json({ 
      error: 'Failed to sync matches',
      details: error.message 
    });
  }
});

/**
 * POST /api/sync/bulk-players
 * Bulk sync multiple pro players
 */
router.post('/bulk-players', async (req, res) => {
  try {
    const { players } = req.body;
    
    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ error: 'players array is required' });
    }
    
    const results = await DataSyncService.bulkSyncProPlayers(players);
    
    res.json({ 
      success: true, 
      message: 'Bulk sync completed',
      results 
    });
  } catch (error) {
    console.error('Error in bulk sync:', error);
    res.status(500).json({ 
      error: 'Failed to sync players',
      details: error.message 
    });
  }
});

/**
 * POST /api/sync/rankings
 * Manually trigger rankings update
 */
router.post('/rankings', async (req, res) => {
  try {
    const result = await CronJobsService.triggerRankingsUpdate();
    
    if (result.success) {
      res.json({ success: true, message: 'Rankings update completed' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({ 
      error: 'Failed to update rankings',
      details: error.message 
    });
  }
});

/**
 * GET /api/sync/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

/**
 * DELETE /api/sync/cache/clear
 * Clear all cache
 */
router.delete('/cache/clear', async (req, res) => {
  try {
    clearCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;

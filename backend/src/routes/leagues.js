const express = require('express');
const pool = require('../config/database');
const { getCache, setCache } = require('../middleware/cache');

const router = express.Router();

/**
 * GET /api/leagues/:region/rankings
 * Get league rankings by region
 */
router.get('/:region/rankings', async (req, res) => {
  try {
    const { region } = req.params;
    const { tier = 'CHALLENGER', queue = 'RANKED_SOLO_5x5' } = req.query;
    
    const cacheKey = `league_rankings_${region}_${tier}_${queue}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Query to get top players from this region/tier
    const query = `
      SELECT 
        p.id,
        p.name,
        p.tier,
        p.rank,
        p.league_points,
        p.wins,
        p.losses,
        ROUND(p.wins::DECIMAL / NULLIF(p.wins + p.losses, 0) * 100, 2) as winrate,
        t.name as team_name,
        t.logo_url as team_logo
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.region = $1 
        AND p.tier = $2
      ORDER BY p.league_points DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [region, tier]);
    const rankings = result.rows;
    
    setCache(cacheKey, rankings, 3600); // Cache for 1 hour
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching league rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

/**
 * GET /api/leagues/regions
 * Get available regions
 */
router.get('/regions', async (req, res) => {
  try {
    const regions = [
      { id: 'br1', name: 'CBLOL', label: 'Brasil' },
      { id: 'na1', name: 'LCS', label: 'North America' },
      { id: 'euw1', name: 'LEC', label: 'Europe' },
      { id: 'kr', name: 'LCK', label: 'Korea' },
      { id: 'jp1', name: 'LJL', label: 'Japan' },
      { id: 'la1', name: 'LLA', label: 'Latin America' },
      { id: 'oc1', name: 'LCO', label: 'Oceania' },
      { id: 'tr1', name: 'TCL', label: 'Turkey' }
    ];
    
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

module.exports = router;

const express = require('express');
const TeamService = require('../services/teamService');
const PlayerService = require('../services/playerService');
const { getCache, setCache } = require('../middleware/cache');

const router = express.Router();

/**
 * GET /api/teams
 * Get all teams
 */
router.get('/', async (req, res) => {
  try {
    const { region, league } = req.query;
    
    const cacheKey = `teams_${region || 'all'}_${league || 'all'}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    let teams;
    
    if (league) {
      teams = await TeamService.getTeamsByLeague(league);
    } else if (region) {
      teams = await TeamService.getTeamsByRegion(region);
    } else {
      teams = await TeamService.getAllTeams();
    }
    
    setCache(cacheKey, teams, 3600); // Cache for 1 hour
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/**
 * GET /api/teams/:id
 * Get team by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `team_${id}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const team = await TeamService.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    setCache(cacheKey, team, 3600); // Cache for 1 hour
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

/**
 * GET /api/teams/:id/players
 * Get players from a team
 */
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `team_players_${id}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const players = await PlayerService.getPlayersByTeam(parseInt(id));
    setCache(cacheKey, players, 600); // Cache for 10 minutes
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching team players:', error);
    res.status(500).json({ error: 'Failed to fetch team players' });
  }
});

module.exports = router;

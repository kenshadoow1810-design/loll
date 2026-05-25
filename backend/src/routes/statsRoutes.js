const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, getPlayers, getPlayerById, getChampionStats, getTotalPlayersCount, getLastUpdateTime } = require('../controllers/statsController');

router.get('/api/teams', getTeams);
router.get('/api/teams/:league', getTeams);
router.get('/api/team/:id', getTeamById);

router.get('/api/api/players', getPlayers);
router.get('/api/players/:league', getPlayers);
router.get('/api/player/:id', getPlayerById);

router.get('/api/champions', getChampionStats);

router.get('/total-players', getTotalPlayersCount);
router.get('/last-update', getLastUpdateTime);

module.exports = router;

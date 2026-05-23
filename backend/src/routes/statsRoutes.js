const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, getPlayers, getPlayerById, getChampionStats, getTotalPlayersCount, getLastUpdateTime } = require('../controllers/statsController');

router.get('/teams', getTeams);
router.get('/teams/:league', getTeams);
router.get('/team/:id', getTeamById);

router.get('/players', getPlayers);
router.get('/players/:league', getPlayers);
router.get('/player/:id', getPlayerById);

router.get('/champions', getChampionStats);

router.get('/stats/total-players', getTotalPlayersCount);
router.get('/stats/last-update', getLastUpdateTime);

module.exports = router;

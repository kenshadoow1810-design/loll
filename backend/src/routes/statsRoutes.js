const express = require('express');
const router = express.Router();
const { getTeams, getPlayers, getPlayerById, getChampionStats } = require('../controllers/statsController');

router.get('/teams', getTeams);
router.get('/teams/:league', getTeams);

router.get('/players', getPlayers);
router.get('/players/:league', getPlayers);
router.get('/player/:id', getPlayerById);

// Rota para estatísticas de campeões (será populada quando os links forem fornecidos)
router.get('/champions', getChampionStats);

module.exports = router;

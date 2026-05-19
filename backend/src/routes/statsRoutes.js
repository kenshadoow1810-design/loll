const express = require('express');
const router = express.Router();
const { getTeams, getPlayers, getPlayerById } = require('../controllers/statsController');

router.get('/teams', getTeams);
router.get('/teams/:league', getTeams);

router.get('/players', getPlayers);
router.get('/players/:league', getPlayers);
router.get('/player/:id', getPlayerById);

module.exports = router;

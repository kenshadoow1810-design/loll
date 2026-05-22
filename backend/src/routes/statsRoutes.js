const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, getPlayers, getPlayerById, getChampionStats, getTotalPlayersCount, getLastUpdateTime } = require('../controllers/statsController');

router.get('/teams', getTeams);
router.get('/teams/:league', getTeams);
router.get('/team/:id', getTeamById);

router.get('/players', getPlayers);
router.get('/players/:league', getPlayers);
router.get('/player/:id', getPlayerById);

// Rota para estatísticas de campeões (será populada quando os links forem fornecidos)
router.get('/champions', getChampionStats);

// Novas rotas para dados dinâmicos da Home
router.get('/stats/total-players', getTotalPlayersCount);
router.get('/stats/last-update', getLastUpdateTime);

module.exports = router;

// Helper function to format last update time
function formatLastUpdate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays}d`;
}

import { Router } from 'express';
import { 
  PlayerController, 
  TeamController, 
  ScheduleController, 
  NewsController, 
  StatsController 
} from '../controllers/index.js';

const router = Router();

// Controllers instances
const playerController = new PlayerController();
const teamController = new TeamController();
const scheduleController = new ScheduleController();
const newsController = new NewsController();
const statsController = new StatsController();

// ==================== PLAYERS ====================

// GET /api/players - Lista todos os jogadores
router.get('/players', playerController.getAllPlayers.bind(playerController));

// GET /api/players/:id - Detalhes de um jogador
router.get('/players/:id', playerController.getPlayerById.bind(playerController));

// ==================== TEAMS ====================

// GET /api/teams - Lista todos os times
router.get('/teams', teamController.getAllTeams.bind(teamController));

// GET /api/teams/:id - Detalhes de um time
router.get('/teams/:id', teamController.getTeamById.bind(teamController));

// ==================== LEAGUES/RANKINGS ====================

// GET /api/leagues/:leagueId/rankings - Rankings da liga
router.get('/leagues/:leagueId/rankings', statsController.getRankings.bind(statsController));

// ==================== SCHEDULE ====================

// GET /api/schedule - Próximas partidas
router.get('/schedule', scheduleController.getUpcomingMatches.bind(scheduleController));

// ==================== NEWS ====================

// GET /api/news - Últimas notícias
router.get('/news', newsController.getAllNews.bind(newsController));

// GET /api/news/:id - Detalhes de uma notícia
router.get('/news/:id', newsController.getNewsById.bind(newsController));

// ==================== STATS ====================

// GET /api/stats/champions - Campeões mais jogados
router.get('/stats/champions', statsController.getMostPlayedChampions.bind(statsController));

// GET /api/stats/kda/top - Top KDA
router.get('/stats/kda/top', statsController.getTopPlayersKDA.bind(statsController));

// GET /api/stats/compare - Comparar jogadores
router.get('/stats/compare', playerController.comparePlayers.bind(playerController));

// GET /api/stats/rankings - Rankings geral ou por liga
router.get('/stats/rankings', statsController.getRankings.bind(statsController));

export default router;

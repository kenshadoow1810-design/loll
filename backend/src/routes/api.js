import { Router } from 'express';
import { playerQueries, teamQueries, scheduleQueries, newsQueries, statsQueries } from '../services/databaseService.js';

const router = Router();

// ==================== PLAYERS ====================

// GET /api/players - Lista todos os jogadores
router.get('/players', async (req, res) => {
  try {
    const { limit = 100, league, search } = req.query;
    
    let players;
    if (search) {
      players = await playerQueries.getByName(search);
    } else if (league) {
      players = await playerQueries.getByLeague(league);
    } else {
      players = await playerQueries.getAll(parseInt(limit));
    }
    
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/players/top - Top jogadores por KDA
router.get('/players/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const players = await playerQueries.getTopPlayers(parseInt(limit));
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('Erro ao buscar top jogadores:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/players/:id - Detalhes de um jogador
router.get('/players/:id', async (req, res) => {
  try {
    const player = await playerQueries.getById(parseInt(req.params.id));
    
    if (!player) {
      return res.status(404).json({ success: false, error: 'Jogador não encontrado' });
    }
    
    res.json({ success: true, data: player });
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== TEAMS ====================

// GET /api/teams - Lista todos os times
router.get('/teams', async (req, res) => {
  try {
    const { league } = req.query;
    
    let teams;
    if (league) {
      teams = await teamQueries.getByLeague(league);
    } else {
      teams = await teamQueries.getAll();
    }
    
    res.json({ success: true, data: teams });
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== LEAGUES/RANKINGS ====================

// GET /api/leagues/:leagueId/rankings - Rankings da liga
router.get('/leagues/:leagueId/rankings', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const players = await playerQueries.getByLeague(leagueId);
    
    // Agrupar por time para criar ranking
    const teamRankings = {};
    players.forEach(player => {
      if (!teamRankings[player.team_name]) {
        teamRankings[player.team_name] = {
          team: player.team_name,
          logo_url: player.team_logo,
          players: []
        };
      }
      teamRankings[player.team_name].players.push(player);
    });
    
    res.json({ 
      success: true, 
      data: {
        league: leagueId,
        teams: Object.values(teamRankings),
        players
      }
    });
  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== SCHEDULE ====================

// GET /api/schedule - Próximas partidas
router.get('/schedule', async (req, res) => {
  try {
    const { league, limit = 50 } = req.query;
    const matches = await scheduleQueries.getUpcoming(league || null, parseInt(limit));
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== NEWS ====================

// GET /api/news - Últimas notícias
router.get('/news', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const news = await newsQueries.getLatest(parseInt(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== STATS ====================

// GET /api/stats/champions - Campeões mais jogados
router.get('/stats/champions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const champions = await statsQueries.getMostPlayedChampions(parseInt(limit));
    res.json({ success: true, data: champions });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de campeões:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/stats/kda/top - Top KDA
router.get('/stats/kda/top', async (req, res) => {
  try {
    const { limit = 5, minGames = 5 } = req.query;
    const topKDA = await statsQueries.getTopKDA(parseInt(limit), parseInt(minGames));
    res.json({ success: true, data: topKDA });
  } catch (error) {
    console.error('Erro ao buscar top KDA:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/stats/compare - Comparar jogadores
router.get('/stats/compare', async (req, res) => {
  try {
    const { player1, player2 } = req.query;
    
    if (!player1 || !player2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Parâmetros player1 e player2 são obrigatórios' 
      });
    }
    
    const comparison = await statsQueries.getPlayerComparison(
      parseInt(player1), 
      parseInt(player2)
    );
    
    if (comparison.length !== 2) {
      return res.status(404).json({ 
        success: false, 
        error: 'Um ou ambos os jogadores não foram encontrados' 
      });
    }
    
    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('Erro ao comparar jogadores:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;

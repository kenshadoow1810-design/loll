import playerService from '../services/playerService.js';
import teamService from '../services/teamService.js';
import scheduleService from '../services/scheduleService.js';
import newsService from '../services/newsService.js';
import statsService from '../services/statsService.js';

export class PlayerController {
  async getAllPlayers(req, res) {
    try {
      const { team, league, search } = req.query;
      const players = await playerService.getAllPlayers({ team, league, search });
      res.json({ success: true, data: players });
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar jogadores' });
    }
  }

  async getPlayerById(req, res) {
    try {
      const { id } = req.params;
      const player = await playerService.getPlayerById(id);
      
      if (!player) {
        return res.status(404).json({ success: false, message: 'Jogador não encontrado' });
      }

      const stats = await playerService.getPlayerStats(id);
      const champions = await playerService.getMostPlayedChampions(id);

      res.json({ 
        success: true, 
        data: { ...player, stats, mostPlayedChampions: champions } 
      });
    } catch (error) {
      console.error('Error fetching player:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar jogador' });
    }
  }

  async comparePlayers(req, res) {
    try {
      const { player1, player2 } = req.query;
      
      if (!player1 || !player2) {
        return res.status(400).json({ 
          success: false, 
          message: 'IDs dos dois jogadores são obrigatórios' 
        });
      }

      const comparison = await playerService.comparePlayers(player1, player2);
      
      if (comparison.length < 2) {
        return res.status(404).json({ 
          success: false, 
          message: 'Um ou ambos os jogadores não foram encontrados' 
        });
      }

      res.json({ success: true, data: comparison });
    } catch (error) {
      console.error('Error comparing players:', error);
      res.status(500).json({ success: false, message: 'Erro ao comparar jogadores' });
    }
  }
}

export class TeamController {
  async getAllTeams(req, res) {
    try {
      const { league } = req.query;
      let teams;
      
      if (league) {
        teams = await teamService.getTeamsByLeague(league);
      } else {
        teams = await teamService.getAllTeams();
      }
      
      res.json({ success: true, data: teams });
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar times' });
    }
  }

  async getTeamById(req, res) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);
      
      if (!team) {
        return res.status(404).json({ success: false, message: 'Time não encontrado' });
      }

      const players = await teamService.getTeamPlayers(id);

      res.json({ 
        success: true, 
        data: { ...team, players } 
      });
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar time' });
    }
  }
}

export class ScheduleController {
  async getUpcomingMatches(req, res) {
    try {
      const { league, date } = req.query;
      const matches = await scheduleService.getUpcomingMatches({ league, date });
      res.json({ success: true, data: matches });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar calendário' });
    }
  }

  async getMatchesByLeague(req, res) {
    try {
      const { league } = req.params;
      const matches = await scheduleService.getMatchesByLeague(league);
      res.json({ success: true, data: matches });
    } catch (error) {
      console.error('Error fetching league schedule:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar calendário da liga' });
    }
  }
}

export class NewsController {
  async getAllNews(req, res) {
    try {
      const { limit = 20 } = req.query;
      const news = await newsService.getAllNews(parseInt(limit));
      res.json({ success: true, data: news });
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar notícias' });
    }
  }

  async getNewsById(req, res) {
    try {
      const { id } = req.params;
      const newsItem = await newsService.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ success: false, message: 'Notícia não encontrada' });
      }

      res.json({ success: true, data: newsItem });
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar notícia' });
    }
  }
}

export class StatsController {
  async getTopPlayersKDA(req, res) {
    try {
      const { limit = 5 } = req.query;
      const players = await statsService.getGlobalTopPlayersKDA(parseInt(limit));
      res.json({ success: true, data: players });
    } catch (error) {
      console.error('Error fetching top KDA players:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar top KDA' });
    }
  }

  async getMostPlayedChampions(req, res) {
    try {
      const { limit = 10 } = req.query;
      const champions = await statsService.getMostPlayedChampionsGlobal(parseInt(limit));
      res.json({ success: true, data: champions });
    } catch (error) {
      console.error('Error fetching most played champions:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar campeões mais jogados' });
    }
  }

  async getRankings(req, res) {
    try {
      const { league } = req.query;
      const rankings = await statsService.getPlayerRankings(league);
      res.json({ success: true, data: rankings });
    } catch (error) {
      console.error('Error fetching rankings:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar rankings' });
    }
  }

  async getLeagueStats(req, res) {
    try {
      const { league } = req.params;
      
      if (!league) {
        return res.status(400).json({ success: false, message: 'Liga é obrigatória' });
      }

      const stats = await statsService.getLeagueStats(league);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching league stats:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas da liga' });
    }
  }
}

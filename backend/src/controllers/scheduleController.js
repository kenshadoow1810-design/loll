const { memoryCache } = require('../services/cacheService');
const { fetchAndStoreMatches, getUpcomingMatches } = require('../services/matchScheduleService');
const { updateImagesAndRealNames } = require('../scripts/updateImages');

const getSchedule = async (req, res) => {
  try {
    const cacheKey = 'matches:upcoming';
    const cachedMatches = memoryCache.get(cacheKey);

    if (cachedMatches) {
      return res.json(cachedMatches);
    }
    const matches = await getUpcomingMatches();
    
    const formattedMatches = matches.map(match => ({
      id: match.match_id_api,
      name: match.name,
      scheduled_at: match.scheduled_at,
      status: match.status,
      number_of_games: match.number_of_games,
      league: {
        id: match.league_id,
        name: match.league_name,
        slug: match.league_slug,
        image_url: match.league_image_url
      },
      tournament: {
        id: match.tournament_id,
        name: match.tournament_name
      },
      opponents: [
        {
          type: 'Team',
          opponent: {
            id: match.team1_id,
            name: match.team1_name,
            acronym: match.team1_acronym,
            image_url: match.team1_logo_url,
            dark_mode_image_url: match.team1_dark_logo_url
          }
        },
        {
          type: 'Team',
          opponent: {
            id: match.team2_id,
            name: match.team2_name,
            acronym: match.team2_acronym,
            image_url: match.team2_logo_url,
            dark_mode_image_url: match.team2_dark_logo_url
          }
        }
      ],
      streams_list: match.stream_url ? [{
        main: true,
        raw_url: match.stream_url
      }] : [],
      slug: match.slug
    }));

    memoryCache.set(cacheKey, formattedMatches, 5 * 60 * 1000);

    res.json(formattedMatches);
  } catch (error) {

    res.status(500).json({ 
      error: 'Erro interno ao buscar partidas' 
    });
  }
};

exports.syncMatches = async (req, res) => {
  try {

    const result = await fetchAndStoreMatches();

    memoryCache.invalidatePrefix('matches:');

    res.json({ 
      message: 'Sincronização concluída com sucesso',
      ...result
    });
  } catch (error) {

    res.status(500).json({ error: 'Erro ao sincronizar partidas' });
  }
};

exports.updateImages = async (req, res) => {
  try {
    await updateImagesAndRealNames();
    res.json({ 
      message: 'Atualização de imagens e nomes reais concluída com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar imagens:', error);
    res.status(500).json({ error: 'Erro ao atualizar imagens' });
  }
};

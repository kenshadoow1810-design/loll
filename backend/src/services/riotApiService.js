const axios = require('axios');
require('dotenv').config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const DDRAGON_BASE_URL = process.env.DDRAGON_BASE_URL;

// Riot API endpoints
const RIOT_API_BASE = 'https://americas.api.riotgames.com';
const RIOT_API_EUW = 'https://europe.api.riotgames.com';
const RIOT_API_KR = 'https://kr.api.riotgames.com';

/**
 * Get player account by summoner name
 */
const getAccountBySummonerName = async (summonerName, region = 'br1') => {
  try {
    const regionUrl = getRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/riot/account/v1/accounts/by-name/${encodeURIComponent(summonerName)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching account for ${summonerName}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get summoner info by PUUID
 */
const getSummonerByPUUID = async (puuid, region = 'br1') => {
  try {
    const regionUrl = getRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching summoner for PUUID ${puuid}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get match IDs by PUUID
 */
const getMatchIdsByPUUID = async (puuid, region = 'br1', start = 0, count = 20) => {
  try {
    const regionUrl = getMatchRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching matches for PUUID ${puuid}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get match details by match ID
 */
const getMatchDetails = async (matchId, region = 'br1') => {
  try {
    const regionUrl = getMatchRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get challenger league for a queue
 */
const getChallengerLeague = async (queue, region = 'br1') => {
  try {
    const regionUrl = getRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/league/v4/challengerleagues/by-queue/${queue}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching challenger league for ${queue}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get grandmaster league for a queue
 */
const getGrandmasterLeague = async (queue, region = 'br1') => {
  try {
    const regionUrl = getRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/league/v4/grandmasterleagues/by-queue/${queue}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching grandmaster league for ${queue}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get master league for a queue
 */
const getMasterLeague = async (queue, region = 'br1') => {
  try {
    const regionUrl = getRegionUrl(region);
    const response = await axios.get(
      `${regionUrl}/lol/league/v4/masterleagues/by-queue/${queue}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching master league for ${queue}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get DDragon champion data
 */
const getChampionData = async (version = 'latest') => {
  try {
    if (version === 'latest') {
      const versionResponse = await axios.get(`${DDRAGON_BASE_URL}/api/versions.json`);
      version = versionResponse.data[0];
    }
    
    const response = await axios.get(
      `${DDRAGON_BASE_URL}/${version}/data/en_US/champion.json`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching champion data:', error.message);
    throw error;
  }
};

/**
 * Get champion image URL
 */
const getChampionImageUrl = (championName, version = 'latest') => {
  if (version === 'latest') {
    version = '14.1.1'; // Fallback version
  }
  return `${DDRAGON_BASE_URL}/${version}/img/champion/${championName}.png`;
};

/**
 * Get profile icon image URL
 */
const getProfileIconUrl = (profileIconId, version = '14.1.1') => {
  return `${DDRAGON_BASE_URL}/${version}/img/profileicon/${profileIconId}.png`;
};

/**
 * Helper to get region URL
 */
const getRegionUrl = (region) => {
  const regionMap = {
    'br1': 'https://americas.api.riotgames.com',
    'na1': 'https://americas.api.riotgames.com',
    'euw1': 'https://europe.api.riotgames.com',
    'eun1': 'https://europe.api.riotgames.com',
    'tr1': 'https://europe.api.riotgames.com',
    'ru': 'https://europe.api.riotgames.com',
    'kr': 'https://kr.api.riotgames.com',
    'jp1': 'https://asia.api.riotgames.com',
    'la1': 'https://americas.api.riotgames.com',
    'la2': 'https://americas.api.riotgames.com',
    'oc1': 'https://sea.api.riotgames.com',
    'ph2': 'https://sea.api.riotgames.com',
    'sg2': 'https://sea.api.riotgames.com',
    'th2': 'https://sea.api.riotgames.com',
    'tw2': 'https://asia.api.riotgames.com',
    'vn2': 'https://sea.api.riotgames.com'
  };
  return regionMap[region] || 'https://americas.api.riotgames.com';
};

/**
 * Helper to get match region URL
 */
const getMatchRegionUrl = (region) => {
  return getRegionUrl(region);
};

module.exports = {
  getAccountBySummonerName,
  getSummonerByPUUID,
  getMatchIdsByPUUID,
  getMatchDetails,
  getChallengerLeague,
  getGrandmasterLeague,
  getMasterLeague,
  getChampionData,
  getChampionImageUrl,
  getProfileIconUrl,
  getRegionUrl,
  getMatchRegionUrl
};

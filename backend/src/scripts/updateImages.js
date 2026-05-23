require('dotenv').config();

const pool = require('../config/database');

const API_BASE_URL = 'https://api.citoapi.com/api/v1/lol/teams';

function convertToSlug(teamName) {
  return teamName
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const TEAM_NAME_MAPPINGS = {
    'RED Canids': 'red',
    'Movistar KOI': 'movistar',
    'ThunderTalk Gaming': 'thunder-talk-gaming',
    'LØS': 'los',
    'Ninjas in Pyjamas': 'ninjas',
    'Team Heretics': 'team-heretics',
    'Vivo Keyd Stars': 'vivo',
    'Fluxo W7M': 'fluxo',
    'Ultra Prime': 'ultra-prime',
    'GiantX': 'giant',
    'DN SOOPers': 'dn-soopers',
};

async function getTeamsFromDB() {
  const query = `
    SELECT DISTINCT name, league
    FROM teams
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getPlayersFromDB() {
  const query = `
    SELECT id, name, team_name, league
    FROM players
    WHERE team_name IS NOT NULL
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function fetchTeamRoster(teamSlug) {
  const token = process.env.CITO_API_TOKEN;

  if (!token) {

    throw new Error('API token not configured');
  }

  try {
    const url = `${API_BASE_URL}/${teamSlug}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent': 'LoL-Stats-App/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {

        return null;
      }

      if (response.status === 429) {

        throw new Error('Rate limit exceeded');
      }

      const errorText = await response.text();

      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      throw error;
    }

    return null;
  }
}

async function updateImagesAndRealNames() {

  try {

    const teams = await getTeamsFromDB();

    const players = await getPlayersFromDB();

    const playersByTeam = new Map();

    for (const player of players) {
      const key = `${player.team_name}-${player.league}`;

      if (!playersByTeam.has(key)) {
        playersByTeam.set(key, []);
      }

      playersByTeam.get(key).push(player);
    }

    let totalUpdated = 0;
    let totalSkipped = 0;
    let apiCallsCount = 0;

    const MAX_API_CALLS = 200;

    for (const team of teams) {
      if (apiCallsCount >= MAX_API_CALLS) {

        break;
      }

      const teamName = team.name;

      const teamSlug =
        TEAM_NAME_MAPPINGS[teamName] ||
        convertToSlug(teamName);

      const rosterData = await fetchTeamRoster(teamSlug);

      if (!rosterData || !rosterData.roster) {

        continue;
      }

      const logoUrl = rosterData.logoUrl || null;

      if (logoUrl) {
        const updateTeamQuery = `
          UPDATE teams
          SET logo_url = $1,
              updated_at = NOW()
          WHERE name = $2
            AND league = $3
        `;

        await pool.query(updateTeamQuery, [
          logoUrl,
          teamName,
          team.league
        ]);

      }

      const apiPlayers = rosterData.roster || [];

      const teamPlayers =
        playersByTeam.get(
          `${teamName}-${team.league}`
        ) || [];

      for (const apiPlayer of apiPlayers) {
        const apiPlayerName =
          apiPlayer.playerName?.trim();

        if (!apiPlayerName) {
          continue;
        }

        const dbPlayer = teamPlayers.find(
          p =>
            p.name?.trim().toLowerCase() ===
            apiPlayerName.toLowerCase()
        );

        if (!dbPlayer) {

          totalSkipped++;
          continue;
        }

        const imageUrl =
          apiPlayer.imageUrl ||
          apiPlayer.player?.imageUrl ||
          null;

        const realName =
          apiPlayer.player?.realName ||
          null;

        const updatePlayerQuery = `
          UPDATE players
          SET image_url = COALESCE($1, image_url),
              real_name = COALESCE($2, real_name),
              updated_at = NOW()
          WHERE id = $3
        `;

        await pool.query(updatePlayerQuery, [
          imageUrl,
          realName,
          dbPlayer.id
        ]);

        totalUpdated++;
      }

      apiCallsCount++;

      if (apiCallsCount < MAX_API_CALLS) {
        await new Promise(resolve =>
          setTimeout(resolve, 500)
        );
      }
    }

  } catch (error) {

    throw error;
  }
}

if (require.main === module) {
  updateImagesAndRealNames()
    .then(() => {

      process.exit(0);
    })
    .catch(error => {

      process.exit(1);
    });
}

module.exports = {
  updateImagesAndRealNames
};

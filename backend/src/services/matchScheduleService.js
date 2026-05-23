const axios = require('axios');
const pool = require('../config/database');

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY || 'your_api_key_here';
const PANDASCORE_BASE_URL = 'https://api.pandascore.co';

const LEAGUE_IDS = [293, 4198, 4197, 4407, 302];

const fetchAndStoreMatches = async () => {
  try {

    const allMatches = [];

    for (const leagueId of LEAGUE_IDS) {
      try {
        const response = await axios.get(`${PANDASCORE_BASE_URL}/lol/matches/upcoming`, {
          headers: {
            'Authorization': `Bearer ${PANDASCORE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          params: {
            'filter[league_id]': leagueId,
            page: 1,
            per_page: 50
          }
        });

        if (response.data && Array.isArray(response.data)) {
          allMatches.push(...response.data);

        }
      } catch (error) {

      }
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const match of allMatches) {
      const matchDate = new Date(match.scheduled_at || match.begin_at);

      if (match.status !== 'not_started' || matchDate < today || matchDate > nextWeek) {
        skippedCount++;
        continue;
      }

      const opponents = match.opponents || [];
      const team1 = opponents[0]?.opponent;
      const team2 = opponents[1]?.opponent;
      const league = match.league || {};
      const tournament = match.tournament || {};
      const hasStream = match.streams_list && match.streams_list.length > 0;
      const streamUrl = hasStream ? match.streams_list.find(s => s.main)?.raw_url?.trim() : null;

      const insertQuery = `
        INSERT INTO matches (
          match_id_api, name, scheduled_at, status, number_of_games,
          league_id, league_name, league_slug, league_image_url,
          tournament_id, tournament_name,
          team1_id, team1_name, team1_acronym, team1_logo_url, team1_dark_logo_url,
          team2_id, team2_name, team2_acronym, team2_logo_url, team2_dark_logo_url,
          stream_url, slug, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW()
        )
        ON CONFLICT (match_id_api) DO UPDATE SET
          name = EXCLUDED.name,
          scheduled_at = EXCLUDED.scheduled_at,
          status = EXCLUDED.status,
          number_of_games = EXCLUDED.number_of_games,
          league_id = EXCLUDED.league_id,
          league_name = EXCLUDED.league_name,
          league_slug = EXCLUDED.league_slug,
          league_image_url = EXCLUDED.league_image_url,
          tournament_id = EXCLUDED.tournament_id,
          tournament_name = EXCLUDED.tournament_name,
          team1_id = EXCLUDED.team1_id,
          team1_name = EXCLUDED.team1_name,
          team1_acronym = EXCLUDED.team1_acronym,
          team1_logo_url = EXCLUDED.team1_logo_url,
          team1_dark_logo_url = EXCLUDED.team1_dark_logo_url,
          team2_id = EXCLUDED.team2_id,
          team2_name = EXCLUDED.team2_name,
          team2_acronym = EXCLUDED.team2_acronym,
          team2_logo_url = EXCLUDED.team2_logo_url,
          team2_dark_logo_url = EXCLUDED.team2_dark_logo_url,
          stream_url = EXCLUDED.stream_url,
          slug = EXCLUDED.slug,
          updated_at = NOW()
        RETURNING id;
      `;

      const values = [
        match.id,
        match.name,
        matchDate,
        match.status,
        match.number_of_games || 1,
        league.id || null,
        league.name || null,
        league.slug || null,
        league.image_url?.trim() || null,
        tournament.id || null,
        tournament.name || null,
        team1?.id || null,
        team1?.name || null,
        team1?.acronym || null,
        team1?.image_url?.trim() || null,
        team1?.dark_mode_image_url?.trim() || null,
        team2?.id || null,
        team2?.name || null,
        team2?.acronym || null,
        team2?.image_url?.trim() || null,
        team2?.dark_mode_image_url?.trim() || null,
        streamUrl,
        match.slug || null
      ];

      const result = await pool.query(insertQuery, values);

      if (result.rows.length > 0) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }

    return { inserted: insertedCount, updated: updatedCount, skipped: skippedCount };
  } catch (error) {

    throw error;
  }
};

const getUpcomingMatches = async () => {
  try {
    const query = `
      SELECT
        id, match_id_api, name, scheduled_at, status, number_of_games,
        league_id, league_name, league_slug, league_image_url,
        tournament_id, tournament_name,
        team1_id, team1_name, team1_acronym, team1_logo_url, team1_dark_logo_url,
        team2_id, team2_name, team2_acronym, team2_logo_url, team2_dark_logo_url,
        stream_url, slug
      FROM matches
      WHERE scheduled_at >= NOW()
      ORDER BY scheduled_at ASC
      LIMIT 10;
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {

    throw error;
  }
};

module.exports = {
  fetchAndStoreMatches,
  getUpcomingMatches
};

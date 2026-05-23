const webPush = require('web-push');
const pool = require('../config/database');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {

}

webPush.setVapidDetails(
  'mailto:seu-email@exemplo.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const saveSubscription = async (subscription, userPreferences = {}) => {
  const { endpoint, keys } = subscription;
  const { favoriteTeams = [], favoriteLeagues = [] } = userPreferences;

  const query = `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, favorite_teams, favorite_leagues, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      favorite_teams = COALESCE(EXCLUDED.favorite_teams, favorite_teams),
      favorite_leagues = COALESCE(EXCLUDED.favorite_leagues, favorite_leagues),
      updated_at = NOW()
    RETURNING id;
  `;

  const values = [endpoint, keys.p256dh, keys.auth, favoriteTeams, favoriteLeagues];

  try {
    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {

    throw error;
  }
};

const sendPushNotification = async (subscription, payload) => {
  try {
    const result = await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      },
      JSON.stringify(payload)
    );

    return { success: true, statusCode: result.statusCode };
  } catch (error) {

    if (error.statusCode === 410) {
      await removeSubscription(subscription.endpoint);
    }
    
    return { success: false, error: error.message };
  }
};

const removeSubscription = async (endpoint) => {
  const query = 'DELETE FROM push_subscriptions WHERE endpoint = $1';
  
  try {
    await pool.query(query, [endpoint]);

  } catch (error) {

  }
};

const getAllSubscriptions = async () => {
  const query = `
    SELECT id, endpoint, p256dh, auth, expiration_time, favorite_teams, favorite_leagues
    FROM push_subscriptions
    WHERE expiration_time IS NULL OR expiration_time > NOW()
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {

    throw error;
  }
};

const checkAndSendMatchNotifications = async (minutesBefore = 15) => {
  try {

    const matchQuery = `
      SELECT 
        m.id, m.match_id_api, m.scheduled_at, m.name,
        m.team1_name, m.team1_acronym, m.team1_logo_url,
        m.team2_name, m.team2_acronym, m.team2_logo_url,
        m.league_name, m.stream_url
      FROM matches m
      WHERE m.status = 'not_started'
        AND m.scheduled_at BETWEEN NOW() + INTERVAL '1 minute' 
                               AND NOW() + INTERVAL '${minutesBefore + 5} minutes'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.match_id = m.id 
            AND n.sent_at >= NOW() - INTERVAL '1 hour'
        )
      ORDER BY m.scheduled_at ASC
    `;
    
    const matchesResult = await pool.query(matchQuery);
    const matches = matchesResult.rows;
    
    if (matches.length === 0) {

      return { sent: 0 };
    }

    const subscriptions = await getAllSubscriptions();
    
    if (subscriptions.length === 0) {

      return { sent: 0 };
    }
    
    let sentCount = 0;
    

    for (const match of matches) {
      const payload = {
        title: `Partida começando em ${minutesBefore} min!`,
        body: `${match.team1_acronym || match.team1_name} vs ${match.team2_acronym || match.team2_name}`,
        icon: match.team1_logo_url || 'https://via.placeholder.com/192x192?text=Match',
        badge: 'https://via.placeholder.com/72x72?text=L',
        data: {
          matchId: match.match_id_api,
          team1: match.team1_name,
          team2: match.team2_name,
          league: match.league_name,
          scheduledAt: match.scheduled_at,
          streamUrl: match.stream_url
        },
        tag: `match-${match.match_id_api}`,
        requireInteraction: false
      };
      

      const insertNotificationQuery = `
        INSERT INTO notifications (match_id, title, body, icon, data, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id;
      `;
      
      const notificationResult = await pool.query(insertNotificationQuery, [
        match.id,
        payload.title,
        payload.body,
        payload.icon,
        JSON.stringify(payload.data)
      ]);
      
      const notificationId = notificationResult.rows[0].id;
      

      const interestedSubscriptions = subscriptions.filter(sub => {
        const favoriteTeams = sub.favorite_teams || [];
        const favoriteLeagues = sub.favorite_leagues || [];
        

        if (favoriteTeams.length === 0 && favoriteLeagues.length === 0) {
          return true;
        }

        const hasFavoriteTeam = favoriteTeams.some(team => 
          team.toLowerCase() === (match.team1_name || '').toLowerCase() ||
          team.toLowerCase() === (match.team2_name || '').toLowerCase() ||
          team.toLowerCase() === (match.team1_acronym || '').toLowerCase() ||
          team.toLowerCase() === (match.team2_acronym || '').toLowerCase()
        );

        const hasFavoriteLeague = favoriteLeagues.some(league =>
          league.toLowerCase() === (match.league_name || '').toLowerCase()
        );

        return hasFavoriteTeam || hasFavoriteLeague;
      });

      for (const subscription of interestedSubscriptions) {
        const result = await sendPushNotification(subscription, payload);
        
        if (result.success) {
          sentCount++;
        }
      }
      

      await pool.query(
        'UPDATE notifications SET status = $1 WHERE id = $2',
        ['sent', notificationId]
      );

    }

    return { sent: sentCount };
    
  } catch (error) {

    throw error;
  }
};

module.exports = {
  saveSubscription,
  sendPushNotification,
  removeSubscription,
  getAllSubscriptions,
  checkAndSendMatchNotifications,
  getVapidPublicKey: () => VAPID_PUBLIC_KEY
};

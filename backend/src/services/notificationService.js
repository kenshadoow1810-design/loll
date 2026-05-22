const webPush = require('web-push');
const pool = require('../config/database');

// Configurar chaves VAPID (gerar uma vez e salvar nas variáveis de ambiente)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('⚠️  Chaves VAPID não configuradas. Web Push não funcionará corretamente.');
  console.warn('Execute: npx web-push generate-vapid-keys --json');
}

webPush.setVapidDetails(
  'mailto:seu-email@exemplo.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/**
 * Salvar ou atualizar uma subscrição de push
 */
const saveSubscription = async (subscription) => {
  const { endpoint, keys } = subscription;
  
  const query = `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      updated_at = NOW()
    RETURNING id;
  `;
  
  const values = [endpoint, keys.p256dh, keys.auth];
  
  try {
    const result = await pool.query(query, values);
    console.log('Subscrição salva/atualizada:', result.rows[0]?.id);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao salvar subscrição:', error.message);
    throw error;
  }
};

/**
 * Enviar notificação push para uma subscrição específica
 */
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
    
    console.log('Notificação enviada com sucesso:', result.statusCode);
    return { success: true, statusCode: result.statusCode };
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error.message);
    
    // Se o erro for 410 (Gone), a subscrição expirou - remover do banco
    if (error.statusCode === 410) {
      await removeSubscription(subscription.endpoint);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Remover uma subscrição inválida
 */
const removeSubscription = async (endpoint) => {
  const query = 'DELETE FROM push_subscriptions WHERE endpoint = $1';
  
  try {
    await pool.query(query, [endpoint]);
    console.log('Subscrição removida:', endpoint);
  } catch (error) {
    console.error('Erro ao remover subscrição:', error.message);
  }
};

/**
 * Buscar todas as subscrições ativas
 */
const getAllSubscriptions = async () => {
  const query = `
    SELECT id, endpoint, p256dh, auth, expiration_time
    FROM push_subscriptions
    WHERE expiration_time IS NULL OR expiration_time > NOW()
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar subscrições:', error.message);
    throw error;
  }
};

/**
 * Buscar partidas que começam em X minutos e enviar notificações
 */
const checkAndSendMatchNotifications = async (minutesBefore = 15) => {
  try {
    console.log(`Verificando partidas que começam em ${minutesBefore} minutos...`);
    
    // Buscar partidas que começam nos próximos X minutos
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
      console.log('Nenhuma partida encontrada para notificar neste momento.');
      return { sent: 0 };
    }
    
    console.log(`${matches.length} partida(s) encontrada(s) para notificar.`);
    
    // Buscar todas as subscrições ativas
    const subscriptions = await getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      console.log('Nenhuma subscrição de push encontrada.');
      return { sent: 0 };
    }
    
    let sentCount = 0;
    
    // Para cada partida, criar notificação e enviar para todos os usuários
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
      
      // Salvar notificação no banco
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
      
      // Enviar para todas as subscrições
      for (const subscription of subscriptions) {
        const result = await sendPushNotification(subscription, payload);
        
        if (result.success) {
          sentCount++;
        }
      }
      
      // Atualizar status da notificação
      await pool.query(
        'UPDATE notifications SET status = $1 WHERE id = $2',
        ['sent', notificationId]
      );
      
      console.log(`Notificação enviada para partida: ${match.team1_name} vs ${match.team2_name}`);
    }
    
    console.log(`Total de notificações enviadas: ${sentCount}`);
    return { sent: sentCount };
    
  } catch (error) {
    console.error('Erro ao verificar e enviar notificações:', error.message);
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

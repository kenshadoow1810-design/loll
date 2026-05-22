const express = require('express');
const router = express.Router();
const { saveSubscription, checkAndSendMatchNotifications, getVapidPublicKey } = require('../services/notificationService');

// Token de autenticação para o endpoint de check-matches (usado pelo GitHub Actions)
const NOTIFICATION_API_TOKEN = process.env.NOTIFICATION_API_TOKEN;

/**
 * GET /api/notifications/vapid-public-key
 * Retorna a chave pública VAPID para o frontend configurar o push
 */
router.get('/notifications/vapid-public-key', (req, res) => {
  const publicKey = getVapidPublicKey();
  
  if (!publicKey) {
    return res.status(500).json({ 
      error: 'Chave VAPID não configurada. Configure VAPID_PUBLIC_KEY no ambiente.' 
    });
  }
  
  res.json({ publicKey });
});

/**
 * POST /api/notifications/subscribe
 * Salva uma nova subscrição de push notification com preferências opcionais
 */
router.post('/notifications/subscribe', async (req, res) => {
  try {
    const subscription = req.body.subscription || req.body;
    const userPreferences = req.body.preferences || {};
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ 
        error: 'Subscrição inválida. Endpoint é obrigatório.' 
      });
    }
    
    console.log('Recebendo subscrição:', subscription.endpoint);
    console.log('Preferências do usuário:', userPreferences);
    
    const result = await saveSubscription(subscription, userPreferences);
    
    res.json({ 
      success: true, 
      message: 'Subscrição salva com sucesso',
      id: result?.id
    });
  } catch (error) {
    console.error('Erro ao salvar subscrição:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar subscrição',
      details: error.message 
    });
  }
});

/**
 * POST /api/notifications/check-matches
 * Endpoint manual para verificar e enviar notificações de partidas
 * (Será chamado pelo GitHub Actions cron)
 * Protegido por token de autenticação
 */
router.post('/notifications/check-matches', async (req, res) => {
  try {
    // Verificar autenticação via token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;
    
    if (!token || token !== NOTIFICATION_API_TOKEN) {
      console.warn('Tentativa de acesso não autorizado ao endpoint check-matches');
      return res.status(401).json({ 
        error: 'Não autorizado. Token de autenticação necessário.' 
      });
    }
    
    const minutesBefore = parseInt(req.query.minutes) || 15;
    
    console.log(`[API] Iniciando verificação de partidas (${minutesBefore} min)...`);
    
    const result = await checkAndSendMatchNotifications(minutesBefore);
    
    res.json({ 
      success: true, 
      message: 'Verificação concluída',
      notificationsSent: result.sent
    });
  } catch (error) {
    console.error('[API] Erro na verificação de partidas:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar partidas',
      details: error.message 
    });
  }
});

/**
 * GET /api/notifications/stats
 * Retorna estatísticas de notificações
 */
router.get('/notifications/stats', async (req, res) => {
  try {
    const pool = require('../config/database');
    
    const subscriptionsCount = await pool.query(
      'SELECT COUNT(*) FROM push_subscriptions'
    );
    
    const notificationsStats = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM notifications 
      GROUP BY status
    `);
    
    res.json({
      activeSubscriptions: subscriptionsCount.rows[0]?.count || 0,
      notifications: notificationsStats.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
});

module.exports = router;

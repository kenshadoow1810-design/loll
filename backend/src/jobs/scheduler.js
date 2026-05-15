const cron = require('node-cron');
const syncService = require('../services/syncService');

/**
 * Configura os Cron Jobs para sincronização automática de dados
 */
function initializeJobs() {
  console.log('⏰ Configurando Cron Jobs...');

  // Job 1: Sincronizar Times e Jogadores a cada 1 hora
  // Formato Cron: '0 * * * *' = roda no minuto 0 de cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('\n🕐 [Cron] Executando sincronização de Times e Jogadores...');
    try {
      await syncService.syncTeams();
      await syncService.syncPlayers();
    } catch (error) {
      console.error('💥 [Cron] Falha na sincronização de Times/Jogadores:', error.message);
    }
  });

  // Job 2: Sincronizar Calendário de Partidas a cada 30 minutos
  // Formato Cron: '*/30 * * * *' = roda a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log('\n🕒 [Cron] Executando sincronização de Calendário...');
    try {
      await syncService.syncSchedule();
    } catch (error) {
      console.error('💥 [Cron] Falha na sincronização de Calendário:', error.message);
    }
  });

  console.log('✅ Cron Jobs configurados com sucesso!');
  console.log('   - Times/Jogadores: Atualização horária (minuto 0)');
  console.log('   - Calendário: Atualização a cada 30 min');
}

module.exports = {
  initializeJobs
};

const cron = require('node-cron');
const { runExtraction } = require('../services/dataPipeline');
const { updateImagesAndRealNames } = require('./updateImages');
const { fetchAndStoreMatches } = require('../services/matchScheduleService');

function startScheduler() {
  console.log('Agendador iniciado: pipeline rodará a cada hora');
  
  // Executar extração de dados a cada hora
  cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Executando pipeline agendada...`);
    try {
      await runExtraction();
      console.log('Pipeline agendada concluída com sucesso');
    } catch (error) {
      console.error('Erro na pipeline agendada:', error);
    }
  });

  // Executar atualização de imagens e nomes reais uma vez por dia às 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Executando atualização de imagens e nomes reais...`);
    try {
      await updateImagesAndRealNames();
      console.log('Atualização de imagens concluída com sucesso');
    } catch (error) {
      console.error('Erro na atualização de imagens:', error);
    }
  });

  // Executar sincronização de partidas a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Executando sincronização de partidas...`);
    try {
      await fetchAndStoreMatches();
      console.log('Sincronização de partidas concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização de partidas:', error);
    }
  });
}

module.exports = { startScheduler };

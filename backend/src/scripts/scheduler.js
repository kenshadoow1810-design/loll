const cron = require('node-cron');
const { runExtraction } = require('./dataPipeline');

function startScheduler() {
  console.log('Agendador iniciado: pipeline rodará a cada hora');
  
  cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Executando pipeline agendada...`);
    try {
      await runExtraction();
      console.log('Pipeline agendada concluída com sucesso');
    } catch (error) {
      console.error('Erro na pipeline agendada:', error);
    }
  });
}

module.exports = { startScheduler };

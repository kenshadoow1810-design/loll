// Scheduler removido - agora usando GitHub Actions para agendamento
// As funções são executadas via endpoints API chamados pelo GitHub Actions

const { runExtraction } = require('../services/dataPipeline');
const { updateImagesAndRealNames } = require('./updateImages');
const { fetchAndStoreMatches } = require('../services/matchScheduleService');

// Funções exportadas para uso manual ou via API
async function runExtractionManual() {
  try {
    await runExtraction();
    console.log('Extração concluída com sucesso');
  } catch (error) {
    console.error('Erro na extração:', error);
    throw error;
  }
}

async function updateImagesManual() {
  try {
    await updateImagesAndRealNames();
    console.log('Atualização de imagens concluída com sucesso');
  } catch (error) {
    console.error('Erro na atualização de imagens:', error);
    throw error;
  }
}

async function syncMatchesManual() {
  try {
    await fetchAndStoreMatches();
    console.log('Sincronização de partidas concluída com sucesso');
  } catch (error) {
    console.error('Erro na sincronização de partidas:', error);
    throw error;
  }
}

module.exports = { 
  runExtractionManual, 
  updateImagesManual, 
  syncMatchesManual 
};

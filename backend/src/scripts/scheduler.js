const { runExtraction } = require('../services/dataPipeline');
const { updateImagesAndRealNames } = require('./updateImages');
const { fetchAndStoreMatches } = require('../services/matchScheduleService');

async function runExtractionManual() {
  try {
    await runExtraction();
    console.log('Data extraction completed successfully');
  } catch (error) {
    console.error('Error in data extraction:', error);
    throw error;
  }
}

async function updateImagesManual() {
  try {
    await updateImagesAndRealNames();
    console.log('Successfully updated images and real names');
  } catch (error) {
    console.error('Error updating images and real names:', error);
    throw error;
  }
}

async function syncMatchesManual() {
  try {
    await fetchAndStoreMatches();
    console.log('Successfully synchronized matches');
  } catch (error) {
    console.error('Error synchronizing matches:', error);
    throw error;
  }
}

module.exports = { 
  runExtractionManual, 
  updateImagesManual, 
  syncMatchesManual 
};

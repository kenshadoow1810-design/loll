const cron = require('node-cron');
const { runExtraction } = require('../services/dataPipeline');
const { updateImagesAndRealNames } = require('./updateImages');
const { fetchAndStoreMatches } = require('../services/matchScheduleService');

function startScheduler() {

  cron.schedule('0 * * * *', async () => {

    try {
      await runExtraction();

    } catch (error) {

    }
  });

  cron.schedule('0 3 * * *', async () => {

    try {
      await updateImagesAndRealNames();

    } catch (error) {

    }
  });

  cron.schedule('*/30 * * * *', async () => {

    try {
      await fetchAndStoreMatches();

    } catch (error) {

    }
  });
}

module.exports = { startScheduler };

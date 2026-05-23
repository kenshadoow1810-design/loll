const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createTables } = require('./config/schema');
const statsRoutes = require('./routes/statsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const { runExtraction } = require('./services/dataPipeline');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', statsRoutes);
app.use('/api', scheduleRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/extract', async (req, res) => {
  try {

    await runExtraction();
    res.json({ message: 'Extração concluída com sucesso' });
  } catch (error) {

    res.status(500).json({ error: 'Erro ao executar extração' });
  }
});

async function startServer() {
  try {
    await createTables();

    const { fetchAndStoreMatches } = require('./services/matchScheduleService');

    await fetchAndStoreMatches();
    
    app.listen(PORT, () => {

    });
  } catch (error) {

    process.exit(1);
  }
}

startServer();

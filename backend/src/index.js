const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./config/schema');
const statsRoutes = require('./routes/statsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const { runExtractionFromCSV } = require('./services/dataPipeline');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api', statsRoutes);
app.use('/api', scheduleRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('/*path', (req, res) => {

    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/extract', async (req, res) => {
  try {
    await runExtractionFromCSV();
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
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

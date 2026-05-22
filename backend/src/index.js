const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createTables } = require('./config/schema');
const statsRoutes = require('./routes/statsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { runExtraction } = require('./services/dataPipeline');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', statsRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/extract', async (req, res) => {
  try {
    console.log('Extração manual iniciada via API...');
    await runExtraction();
    res.json({ message: 'Extração concluída com sucesso' });
  } catch (error) {
    console.error('Erro na extração manual:', error);
    res.status(500).json({ error: 'Erro ao executar extração' });
  }
});

async function startServer() {
  try {
    await createTables();
    console.log('Banco de dados inicializado');
    
    // Sincronizar partidas ao iniciar o servidor
    const { fetchAndStoreMatches } = require('./services/matchScheduleService');
    console.log('Sincronizando partidas na inicialização...');
    await fetchAndStoreMatches();
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Endpoints disponíveis:`);
      console.log(`  GET /api/teams - Lista todos os times`);
      console.log(`  GET /api/teams/:league - Times por liga`);
      console.log(`  GET /api/players - Lista todos os jogadores`);
      console.log(`  GET /api/players/:league - Jogadores por liga`);
      console.log(`  GET /api/player/:id - Detalhes do jogador`);
      console.log(`  GET /api/schedule - Cronograma de partidas`);
      console.log(`  POST /api/schedule/sync - Sincronizar partidas manualmente`);
      console.log(`  POST /api/extract - Executa extração manual`);
      console.log(`  GET /api/notifications/vapid-public-key - Chave pública VAPID`);
      console.log(`  POST /api/notifications/subscribe - Salvar subscrição push`);
      console.log(`  POST /api/notifications/check-matches - Verificar notificações (cron)`);
      console.log(`  GET /api/notifications/stats - Estatísticas de notificações`);
      console.log(`  GET /health - Health check`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

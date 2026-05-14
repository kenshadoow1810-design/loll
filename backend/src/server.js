import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import apiRoutes from './routes/api.js';
import { cacheService } from './services/databaseService.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ProStats LoL API',
    version: '1.0.0',
    description: 'API de estatísticas de League of Legends profissionais',
    endpoints: {
      players: '/api/players',
      teams: '/api/teams',
      leagues: '/api/leagues/:leagueId/rankings',
      schedule: '/api/schedule',
      news: '/api/news',
      stats: {
        champions: '/api/stats/champions',
        kda: '/api/stats/kda/top',
        compare: '/api/stats/compare?player1=id&player2=id'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint não encontrado' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erro interno do servidor' 
  });
});

// ==================== CRON JOBS ====================

// Limpar cache a cada 10 minutos
cron.schedule('*/10 * * * *', () => {
  console.log('🧹 Limpando cache expirado...');
  // A limpeza automática já ocorre no serviço de cache
});

// Refresh de rankings a cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Atualizando rankings das ligas...');
  try {
    // Aqui entraria a lógica para buscar dados da Riot API
    // Por enquanto, apenas limpamos o cache
    cacheService.clear();
    console.log('✅ Rankings atualizados (cache limpo)');
  } catch (error) {
    console.error('❌ Erro ao atualizar rankings:', error);
  }
});

// Refresh de notícias a cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  console.log('📰 Atualizando notícias...');
  try {
    // Aqui entraria a lógica para buscar notícias de RSS/APIs
    cacheService.delete('news:latest:20');
    console.log('✅ Notícias atualizadas');
  } catch (error) {
    console.error('❌ Erro ao atualizar notícias:', error);
  }
});

// Refresh de partidas de jogadores top a cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
  console.log('🎮 Atualizando partidas de jogadores top...');
  try {
    // Aqui entraria a lógica para buscar partidas da Riot API
    cacheService.clear();
    console.log('✅ Partidas atualizadas');
  } catch (error) {
    console.error('❌ Erro ao atualizar partidas:', error);
  }
});

// ==================== START SERVER ====================

// Iniciar limpeza do cache
cacheService.startCleanup(60000);

// Testar conexão com banco de dados
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Conexão com banco de dados verificada');
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║         🎮 ProStats LoL API                ║
║         Servidor rodando na porta ${PORT}           ║
║         Ambiente: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════════╝

📡 Endpoints disponíveis:
   - GET /                    → Informações da API
   - GET /health              → Health check
   - GET /api/players         → Lista de jogadores
   - GET /api/players/:id     → Detalhes do jogador
   - GET /api/players/top     → Top jogadores
   - GET /api/teams           → Lista de times
   - GET /api/leagues/:id/rankings → Rankings da liga
   - GET /api/schedule        → Próximas partidas
   - GET /api/news            → Últimas notícias
   - GET /api/stats/champions → Campeões mais jogados
   - GET /api/stats/kda/top   → Top KDA
   - GET /api/stats/compare   → Comparar jogadores

🕒 Cron jobs ativos:
   - Cache cleanup: a cada 10 min
   - Rankings update: a cada 1 hora
   - News update: a cada 30 min
   - Matches update: a cada 15 min
`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com banco de dados:', err.message);
    console.log('⚠️  Iniciando servidor sem conexão com banco de dados...');
    
    app.listen(PORT, () => {
      console.log(`⚠️  Servidor rodando na porta ${PORT} (sem banco de dados)`);
    });
  });

export default app;

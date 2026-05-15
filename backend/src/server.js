import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { cacheService } from './services/databaseService.js';
import pool from './config/database.js';
import { initializeJobs } from './jobs/scheduler.js';
import { runFullSync } from './services/syncService.js';

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

// ==================== START SERVER ====================

// Iniciar limpeza do cache
cacheService.startCleanup(60000);

// Testar conexão com banco de dados e iniciar
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('✅ Conexão com banco de dados verificada');
    
    // Executar sincronização inicial ao iniciar o servidor
    console.log('🚀 Executando sincronização inicial de dados...');
    try {
      await runFullSync();
    } catch (error) {
      console.error('⚠️ Falha na sincronização inicial:', error.message);
      console.log('Continuando sem dados sincronizados...');
    }
    
    // Inicializar Cron Jobs
    initializeJobs();
    
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
   - Cache cleanup: a cada 1 min
   - Times/Jogadores: Atualização horária (Cito API)
   - Calendário: Atualização a cada 30 min (Cito API)
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

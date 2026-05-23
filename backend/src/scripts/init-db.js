require('dotenv').config();
const { Pool } = require('pg');
// Ajuste o caminho conforme a estrutura real dos seus serviços
const scrapingService = require('../services/scrapingService'); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  console.log('🔧 Iniciando banco de dados...');

  const client = await pool.connect();

  try {
    // 1. Criar tabelas se não existirem
    console.log('📦 Criando tabelas...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS champions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255),
        image_url TEXT,
        roles TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20),
        logo_url TEXT,
        home_ground VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        nickname VARCHAR(100),
        image_url TEXT,
        role VARCHAR(20),
        team_id VARCHAR(100),
        nationality VARCHAR(50),
        birth_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(100) PRIMARY KEY,
        date TIMESTAMP,
        team1_id VARCHAR(100),
        team2_id VARCHAR(100),
        score1 INTEGER,
        score2 INTEGER,
        status VARCHAR(20),
        week INTEGER,
        split VARCHAR(20),
        year INTEGER,
        league VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team1_id) REFERENCES teams(id),
        FOREIGN KEY (team2_id) REFERENCES teams(id)
      );

      CREATE INDEX IF NOT EXISTS idx_champions_name ON champions(name);
      CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
      CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
      CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
    `);

    console.log('✅ Tabelas criadas/atualizadas com sucesso!');

    // 2. Executar Scrapes em sequência
    
    // A. Scrapar Campeões (Dados estáticos)
    console.log('\n🚀 [1/4] Iniciando scrape de Campeões...');
    try {
      if (scrapingService.scrapeChampions) {
        await scrapingService.scrapeChampions();
        console.log('✅ Campeões processados.');
      } else {
        console.log('⚠️ Função scrapeChampions não encontrada no serviço.');
      }
    } catch (err) {
      console.error('❌ Erro ao scrapear campeões:', err.message);
    }

    // B. Scrapar Times (Necessário antes dos jogadores)
    console.log('\n🚀 [2/4] Iniciando scrape de Times...');
    try {
      if (scrapingService.scrapeTeams) {
        await scrapingService.scrapeTeams();
        console.log('✅ Times processados.');
      } else {
        console.log('⚠️ Função scrapeTeams não encontrada no serviço.');
      }
    } catch (err) {
      console.error('❌ Erro ao scrapear times:', err.message);
    }

    // C. Scrapar Jogadores (Depende dos times já estarem no banco)
    console.log('\n🚀 [3/4] Iniciando scrape de Jogadores...');
    try {
      if (scrapingService.scrapePlayers) {
        await scrapingService.scrapePlayers();
        console.log('✅ Jogadores processados.');
      } else {
        console.log('⚠️ Função scrapePlayers não encontrada no serviço.');
      }
    } catch (err) {
      console.error('❌ Erro ao scrapear jogadores:', err.message);
    }

    console.log('\n🎉 Inicialização e Seed concluídos!');

  } catch (error) {
    console.error('💥 Erro crítico na inicialização:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Conexão com banco fechada.');
  }
}

// Executar
initDatabase()
  .then(() => {
    console.log('🏁 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Falha na execução:', err);
    process.exit(1);
  });

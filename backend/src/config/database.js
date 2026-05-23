const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obrigatório para o Render
  },
  max: 20, // Limite de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão explícito no inicio
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados com sucesso');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de clientes inativos', err);
  process.exit(-1);
});

module.exports = pool;

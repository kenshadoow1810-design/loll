import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'prostats_lol',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Conexão com PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const queryClient = client.query.bind(client);
  
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await queryClient(text, params);
      const duration = Date.now() - start;
      console.log('Query executada:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  };
  
  const release = client.release.bind(client);
  client.release = () => {
    console.log('Cliente liberado de volta ao pool');
    return release();
  };
  
  return client;
};

export default pool;

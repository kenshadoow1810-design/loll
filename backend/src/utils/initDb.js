import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Conecta ao banco padrão primeiro
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Criar banco de dados se não existir
    const dbName = process.env.DB_NAME || 'prostats_lol';
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📁 Criando banco de dados: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`✅ Banco de dados ${dbName} já existe`);
    }

    await client.end();

    // Conectar ao banco de dados específico
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await dbClient.connect();
    console.log(`✅ Conectado ao banco ${dbName}`);

    // Executar schema.sql
    const schemaPath = path.join(__dirname, '../../data/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    console.log('📄 Executando schema.sql...');
    await dbClient.query(schemaSQL);
    console.log('✅ Schema criado com sucesso');

    // Executar seed_teams.sql
    const teamsPath = path.join(__dirname, '../../data/seed_teams.sql');
    const teamsSQL = fs.readFileSync(teamsPath, 'utf-8');
    console.log('📄 Executando seed_teams.sql...');
    await dbClient.query(teamsSQL);
    console.log('✅ Times inseridos com sucesso');

    // Executar seed_players.sql
    const playersPath = path.join(__dirname, '../../data/seed_players.sql');
    const playersSQL = fs.readFileSync(playersPath, 'utf-8');
    console.log('📄 Executando seed_players.sql...');
    await dbClient.query(playersSQL);
    console.log('✅ Jogadores inseridos com sucesso');

    // Contar registros
    const teamsCount = await dbClient.query('SELECT COUNT(*) FROM teams');
    const playersCount = await dbClient.query('SELECT COUNT(*) FROM players');
    
    console.log('\n📊 Resumo da inicialização:');
    console.log(`   - Times: ${teamsCount.rows[0].count}`);
    console.log(`   - Jogadores: ${playersCount.rows[0].count}`);

    await dbClient.end();
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase();

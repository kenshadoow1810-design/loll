/**
 * Script para sincronização inicial de dados
 * Executar com: npm run sync:init
 */

import { runFullSync } from '../services/syncService.js';
import pool from '../config/database.js';

async function main() {
  console.log('🚀 Iniciando sincronização manual de dados...\n');

  try {
    // Testar conexão com banco
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados verificada\n');

    // Executar sincronização completa
    await runFullSync();

    console.log('\n🎉 Sincronização inicial concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na sincronização:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

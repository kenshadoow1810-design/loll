const db = require('../config/database');
const citoApi = require('./citoApiService');

/**
 * Sincroniza times da API externa com o banco de dados
 * - Busca dados da API Cito (filtrados por ligas)
 * - Insere ou atualiza no banco apenas se houver mudanças
 */
async function syncTeams() {
  console.log('🔄 Iniciando sincronização de times...');
  
  try {
    const externalTeams = await citoApi.fetchTeams();
    console.log(`📡 ${externalTeams.length} times encontrados na API (filtrados).`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const team of externalTeams) {
      // Verifica se o time já existe pelo ID externo ou nome
      const existingTeam = await db.query(
        'SELECT id FROM teams WHERE external_id = $1 OR name = $2',
        [team.id, team.name]
      );

      if (existingTeam.rows.length === 0) {
        // Insert novo time
        await db.query(
          `INSERT INTO teams (external_id, name, code, logo_url, league, region, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [team.id, team.name, team.code, team.logo, team.league, team.region]
        );
        insertedCount++;
      } else {
        // Update se houver mudanças (ex: logo, nome)
        const teamId = existingTeam.rows[0].id;
        await db.query(
          `UPDATE teams SET 
            name = $2, code = $3, logo_url = $4, league = $5, region = $6, updated_at = NOW()
           WHERE id = $1`,
          [teamId, team.name, team.code, team.logo, team.league, team.region]
        );
        updatedCount++;
      }
    }

    console.log(`✅ Times sincronizados: ${insertedCount} novos, ${updatedCount} atualizados.`);
    return { inserted: insertedCount, updated: updatedCount };
  } catch (error) {
    console.error('❌ Erro na sincronização de times:', error.message);
    throw error;
  }
}

/**
 * Sincroniza jogadores da API externa com o banco de dados
 */
async function syncPlayers() {
  console.log('🔄 Iniciando sincronização de jogadores...');
  
  try {
    const externalPlayers = await citoApi.fetchPlayers();
    console.log(`📡 ${externalPlayers.length} jogadores encontrados na API (filtrados).`);

    let insertedCount = 0;
    let updatedCount = 0;

    // Primeiro garantimos que os times existem para vincular os jogadores
    // (O ideal é rodar syncTeams antes de syncPlayers)
    
    for (const player of externalPlayers) {
      // Busca o ID do time no nosso banco baseado no nome ou external_id do time do jogador
      let teamId = null;
      if (player.team && player.team.name) {
        const teamResult = await db.query(
          'SELECT id FROM teams WHERE name = $1 OR external_id = $2',
          [player.team.name, player.team.id]
        );
        if (teamResult.rows.length > 0) {
          teamId = teamResult.rows[0].id;
        }
      }

      // Verifica se jogador já existe
      const existingPlayer = await db.query(
        'SELECT id FROM players WHERE external_id = $1',
        [player.id]
      );

      if (existingPlayer.rows.length === 0) {
        // Insert novo jogador
        await db.query(
          `INSERT INTO players (external_id, name, real_name, role, photo_url, team_id, league, region, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [player.id, player.name, player.realName, player.role, player.photo, teamId, player.league, player.region]
        );
        insertedCount++;
      } else {
        // Update jogador existente
        const playerId = existingPlayer.rows[0].id;
        await db.query(
          `UPDATE players SET 
            name = $2, real_name = $3, role = $4, photo_url = $5, team_id = $6, league = $7, region = $8, updated_at = NOW()
           WHERE id = $1`,
          [playerId, player.name, player.realName, player.role, player.photo, teamId, player.league, player.region]
        );
        updatedCount++;
      }
    }

    console.log(`✅ Jogadores sincronizados: ${insertedCount} novos, ${updatedCount} atualizados.`);
    return { inserted: insertedCount, updated: updatedCount };
  } catch (error) {
    console.error('❌ Erro na sincronização de jogadores:', error.message);
    throw error;
  }
}

/**
 * Sincroniza calendário de partidas
 */
async function syncSchedule() {
  console.log('🔄 Iniciando sincronização de calendário...');
  
  try {
    const externalMatches = await citoApi.fetchSchedule();
    console.log(`📡 ${externalMatches.length} partidas encontradas na API (filtradas).`);

    let insertedCount = 0;

    for (const match of externalMatches) {
      // Verifica se a partida já existe
      const existingMatch = await db.query(
        'SELECT id FROM schedule WHERE external_id = $1',
        [match.id]
      );

      if (existingMatch.rows.length === 0) {
        // Busca IDs dos times no banco
        let teamAId = null;
        let teamBId = null;

        if (match.teamA) {
          const resA = await db.query('SELECT id FROM teams WHERE external_id = $1', [match.teamA.id]);
          if (resA.rows.length > 0) teamAId = resA.rows[0].id;
        }
        if (match.teamB) {
          const resB = await db.query('SELECT id FROM teams WHERE external_id = $1', [match.teamB.id]);
          if (resB.rows.length > 0) teamBId = resB.rows[0].id;
        }

        // Insert nova partida
        await db.query(
          `INSERT INTO schedule (external_id, team_a_id, team_b_id, scheduled_time, league, stage, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [match.id, teamAId, teamBId, match.time, match.league, match.stage, match.status || 'scheduled']
        );
        insertedCount++;
      }
    }

    console.log(`✅ Calendário sincronizado: ${insertedCount} novas partidas.`);
    return { inserted: insertedCount };
  } catch (error) {
    console.error('❌ Erro na sincronização de calendário:', error.message);
    throw error;
  }
}

/**
 * Executa todas as sincronizações em sequência
 */
async function runFullSync() {
  console.log('🚀 Iniciando sincronização completa...');
  try {
    await syncTeams();
    await syncPlayers();
    await syncSchedule();
    console.log('🎉 Sincronização completa finalizada com sucesso!');
  } catch (error) {
    console.error('💥 Falha na sincronização completa:', error.message);
    throw error;
  }
}

module.exports = {
  syncTeams,
  syncPlayers,
  syncSchedule,
  runFullSync
};

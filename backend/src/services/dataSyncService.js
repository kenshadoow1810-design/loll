const riotApiService = require('./riotApiService');
const PlayerService = require('./playerService');
const MatchService = require('./matchService');
const TeamService = require('./teamService');

/**
 * Data Sync Service - handles synchronization with Riot API
 */
class DataSyncService {
  /**
   * Sync player data from Riot API
   */
  static async syncPlayerData(summonerName, region = 'br1') {
    try {
      // Get account info
      const account = await riotApiService.getAccountBySummonerName(summonerName, region);
      
      // Get summoner info
      const summoner = await riotApiService.getSummonerByPUUID(account.puuid, region);
      
      // Prepare player data
      const playerData = {
        puuid: account.puuid,
        name: account.gameName || summoner.name,
        profile_icon_id: summoner.profileIconId,
        summoner_level: summoner.summonerLevel,
        region
      };
      
      // Upsert player
      const player = await PlayerService.upsertPlayer(playerData);
      
      console.log(`✅ Synced player: ${player.name} (${region})`);
      return player;
    } catch (error) {
      console.error(`❌ Error syncing player ${summonerName}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync player ranked stats
   */
  static async syncPlayerRankedStats(puuid, region = 'br1') {
    try {
      // Note: In a real implementation, we would fetch ranked data from Riot API
      // This requires additional API calls to get league information
      // For now, this is a placeholder for the logic
      
      console.log(`🔄 Syncing ranked stats for PUUID: ${puuid}`);
      // Implementation would go here
    } catch (error) {
      console.error(`❌ Error syncing ranked stats:`, error.message);
      throw error;
    }
  }

  /**
   * Sync player matches
   */
  static async syncPlayerMatches(puuid, playerId, region = 'br1', count = 20) {
    try {
      // Get match IDs
      const matchIds = await riotApiService.getMatchIdsByPUUID(puuid, region, 0, count);
      
      let newMatchesCount = 0;
      
      for (const matchId of matchIds) {
        // Check if match already exists
        const exists = await MatchService.matchExistsForPlayer(matchId, playerId);
        
        if (exists) {
          continue; // Skip existing matches
        }
        
        // Get match details
        const matchData = await riotApiService.getMatchDetails(matchId, region);
        
        // Find player's participant info
        const participant = matchData.info.participants.find(
          p => p.puuid === puuid
        );
        
        if (!participant) {
          continue; // Player not found in this match
        }
        
        // Calculate KDA
        const kda = participant.deaths === 0 
          ? participant.kills + participant.assists 
          : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);
        
        // Prepare match record
        const matchRecord = {
          match_id: matchId,
          player_id: playerId,
          champion: participant.championName,
          role: participant.role,
          lane: participant.lane,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
          gold_earned: participant.goldEarned,
          damage_dealt: participant.totalDamageDealtToChampions,
          damage_taken: participant.totalDamageTaken,
          vision_score: participant.visionScore,
          win: participant.win,
          game_duration: matchData.info.gameDuration,
          game_mode: matchData.info.gameMode,
          game_type: matchData.info.gameType,
          queue_id: matchData.info.queueId,
          spell1_id: participant.spell1Id,
          spell2_id: participant.spell2Id,
          item0: participant.item0,
          item1: participant.item1,
          item2: participant.item2,
          item3: participant.item3,
          item4: participant.item4,
          item5: participant.item5,
          item6: participant.item6,
          kda: parseFloat(kda),
          date: new Date(matchData.info.gameCreation),
          region
        };
        
        // Save match
        await MatchService.createMatch(matchRecord);
        newMatchesCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Synced ${newMatchesCount} new matches for player ID ${playerId}`);
      return newMatchesCount;
    } catch (error) {
      console.error(`❌ Error syncing matches for PUUID ${puuid}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync top players from a league
   */
  static async syncTopPlayersFromLeague(queue, region = 'br1', tier = 'CHALLENGER') {
    try {
      let leagueData;
      
      if (tier === 'CHALLENGER') {
        leagueData = await riotApiService.getChallengerLeague(queue, region);
      } else if (tier === 'GRANDMASTER') {
        leagueData = await riotApiService.getGrandmasterLeague(queue, region);
      } else if (tier === 'MASTER') {
        leagueData = await riotApiService.getMasterLeague(queue, region);
      } else {
        throw new Error('Invalid tier');
      }
      
      let syncedCount = 0;
      
      for (const entry of leagueData.entries) {
        try {
          // Sync player data
          const player = await this.syncPlayerData(entry.summonerName, region);
          
          // Update ranked stats
          await PlayerService.updatePlayerStats(player.puuid, {
            tier: leagueData.tier,
            rank: entry.rank,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses
          });
          
          syncedCount++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error syncing ${entry.summonerName}:`, error.message);
        }
      }
      
      console.log(`✅ Synced ${syncedCount} players from ${tier} ${queue} (${region})`);
      return syncedCount;
    } catch (error) {
      console.error(`❌ Error syncing top players:`, error.message);
      throw error;
    }
  }

  /**
   * Create or get team
   */
  static async createOrGetTeam(teamName, region = null, league = null, logoUrl = null) {
    try {
      let team = await TeamService.getTeamByName(teamName);
      
      if (!team) {
        team = await TeamService.createTeam({
          name: teamName,
          logo_url: logoUrl,
          region,
          league
        });
        console.log(`✅ Created team: ${teamName}`);
      }
      
      return team;
    } catch (error) {
      console.error(`❌ Error creating/getting team ${teamName}:`, error.message);
      throw error;
    }
  }

  /**
   * Bulk sync pro players
   */
  static async bulkSyncProPlayers(playersList) {
    /**
     * playersList format:
     * [
     *   { name: 'PlayerName', region: 'br1', team: 'Team Name' },
     *   ...
     * ]
     */
    const results = {
      success: [],
      failed: []
    };
    
    for (const playerInfo of playersList) {
      try {
        const { name, region = 'br1', team: teamName } = playerInfo;
        
        // Sync player
        const player = await this.syncPlayerData(name, region);
        
        // If team specified, create/get team and update player
        if (teamName) {
          const team = await this.createOrGetTeam(teamName, region);
          await PlayerService.upsertPlayer({
            ...player,
            team_id: team.id
          });
        }
        
        // Sync matches
        await this.syncPlayerMatches(player.puuid, player.id, region, 10);
        
        results.success.push(player.name);
        
        // Delay between players to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.failed.push({ name: playerInfo.name, error: error.message });
        console.error(`❌ Failed to sync ${playerInfo.name}:`, error.message);
      }
    }
    
    console.log(`✅ Bulk sync completed: ${results.success.length} success, ${results.failed.length} failed`);
    return results;
  }
}

module.exports = DataSyncService;

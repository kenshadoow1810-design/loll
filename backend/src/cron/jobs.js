const cron = require('node-cron');
const DataSyncService = require('../services/dataSyncService');
const { setCache, clearCache } = require('../middleware/cache');

/**
 * Cron Jobs Service - handles scheduled data updates
 */
class CronJobsService {
  /**
   * Initialize all cron jobs
   */
  static initializeAll() {
    console.log('🕐 Initializing cron jobs...');
    
    // Update rankings every hour
    this.scheduleRankingsUpdate();
    
    // Update top players matches every 30 minutes
    this.scheduleMatchesUpdate();
    
    // Update news every 30 minutes
    this.scheduleNewsUpdate();
    
    // Clear expired cache every 5 minutes (handled in cache middleware)
    
    console.log('✅ All cron jobs initialized');
  }

  /**
   * Schedule rankings update (every hour)
   */
  static scheduleRankingsUpdate() {
    // Run at minute 0 of every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🔄 Running scheduled rankings update...');
      
      try {
        const regions = ['br1', 'na1', 'euw1', 'kr'];
        const queues = ['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'];
        
        for (const region of regions) {
          for (const queue of queues) {
            try {
              await DataSyncService.syncTopPlayersFromLeague(queue, region, 'CHALLENGER');
              await DataSyncService.syncTopPlayersFromLeague(queue, region, 'GRANDMASTER');
              await DataSyncService.syncTopPlayersFromLeague(queue, region, 'MASTER');
            } catch (error) {
              console.error(`Error updating ${queue} rankings for ${region}:`, error.message);
            }
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Clear rankings cache
        clearCache();
        
        console.log('✅ Rankings update completed');
      } catch (error) {
        console.error('❌ Rankings update failed:', error.message);
      }
    });
    
    console.log('📅 Rankings update scheduled: Every hour at minute 0');
  }

  /**
   * Schedule matches update (every 30 minutes)
   */
  static scheduleMatchesUpdate() {
    // Run at minutes 0 and 30 of every hour
    cron.schedule('0,30 * * * *', async () => {
      console.log('🔄 Running scheduled matches update...');
      
      try {
        // This would fetch top players from database and update their matches
        // For now, it's a placeholder
        console.log('⚠️ Matches update: Implementation pending - no players in database yet');
        
        console.log('✅ Matches update completed');
      } catch (error) {
        console.error('❌ Matches update failed:', error.message);
      }
    });
    
    console.log('📅 Matches update scheduled: Every 30 minutes');
  }

  /**
   * Schedule news update (every 30 minutes)
   */
  static scheduleNewsUpdate() {
    // Run at minutes 15 and 45 of every hour
    cron.schedule('15,45 * * * *', async () => {
      console.log('🔄 Running scheduled news update...');
      
      try {
        // This would fetch news from RSS feeds or APIs
        // For now, it's a placeholder
        console.log('⚠️ News update: Implementation pending - RSS feeder not configured');
        
        console.log('✅ News update completed');
      } catch (error) {
        console.error('❌ News update failed:', error.message);
      }
    });
    
    console.log('📅 News update scheduled: Every 30 minutes (at :15 and :45)');
  }

  /**
   * Manual trigger for rankings update
   */
  static async triggerRankingsUpdate() {
    console.log('🔄 Manually triggering rankings update...');
    
    try {
      const regions = ['br1']; // Start with just BR for testing
      const queues = ['RANKED_SOLO_5x5'];
      
      for (const region of regions) {
        for (const queue of queues) {
          await DataSyncService.syncTopPlayersFromLeague(queue, region, 'CHALLENGER');
        }
      }
      
      console.log('✅ Manual rankings update completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Manual rankings update failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual trigger for matches update
   */
  static async triggerMatchesUpdate(playerIds = null) {
    console.log('🔄 Manually triggering matches update...');
    
    try {
      // Implementation would fetch matches for specified players or all top players
      console.log('⚠️ Matches update: Implementation pending');
      
      console.log('✅ Manual matches update completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Manual matches update failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CronJobsService;

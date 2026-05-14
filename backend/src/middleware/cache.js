// Simple in-memory cache implementation
const cache = new Map();
const cacheTimestamps = new Map();

/**
 * Set a value in cache with TTL (time to live)
 * @param {string} key - Cache key
 * @param {*} value - Value to store
 * @param {number} ttlSeconds - Time to live in seconds
 */
const setCache = (key, value, ttlSeconds = 300) => {
  cache.set(key, value);
  cacheTimestamps.set(key, Date.now() + ttlSeconds * 1000);
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {*} - Cached value or null if expired/not found
 */
const getCache = (key) => {
  const timestamp = cacheTimestamps.get(key);
  
  if (!timestamp || Date.now() > timestamp) {
    // Cache expired or not found
    cache.delete(key);
    cacheTimestamps.delete(key);
    return null;
  }
  
  return cache.get(key);
};

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 */
const deleteCache = (key) => {
  cache.delete(key);
  cacheTimestamps.delete(key);
};

/**
 * Clear all cache
 */
const clearCache = () => {
  cache.clear();
  cacheTimestamps.clear();
};

/**
 * Get cache stats
 */
const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  cacheTimestamps.forEach((timestamp) => {
    if (now > timestamp) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  });
  
  return {
    totalKeys: cache.size,
    validEntries,
    expiredEntries
  };
};

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  cacheTimestamps.forEach((timestamp, key) => {
    if (now > timestamp) {
      cache.delete(key);
      cacheTimestamps.delete(key);
    }
  });
  console.log('🧹 Cache cleanup completed');
}, 5 * 60 * 1000);

module.exports = {
  setCache,
  getCache,
  deleteCache,
  clearCache,
  getCacheStats
};

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos em milissegundos
  }

  generateKey(prefix, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('|');

    return paramString ? `${prefix}:${paramString}` : prefix;
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiry,
      createdAt: Date.now()
    });
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const now = Date.now();
    let total = 0;
    let expired = 0;

    for (const item of this.cache.values()) {
      total++;
      if (now > item.expiry) {
        expired++;
      }
    }

    return {
      total,
      expired,
      active: total - expired
    };
  }

  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

const memoryCache = new MemoryCache();

setInterval(() => {
  memoryCache.cleanup();
}, 60 * 1000);

module.exports = {
  memoryCache,
  MemoryCache
};
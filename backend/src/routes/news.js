const express = require('express');
const NewsService = require('../services/newsService');
const { getCache, setCache } = require('../middleware/cache');

const router = express.Router();

/**
 * GET /api/news
 * Get latest news
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, category, region } = req.query;
    
    const cacheKey = `news_${category || 'all'}_${region || 'all'}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    let news;
    
    if (category) {
      news = await NewsService.getNewsByCategory(category, parseInt(limit));
    } else if (region) {
      news = await NewsService.getNewsByRegion(region, parseInt(limit));
    } else {
      news = await NewsService.getLatestNews(parseInt(limit));
    }
    
    setCache(cacheKey, news, 1800); // Cache for 30 minutes
    
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/**
 * GET /api/news/:id
 * Get news by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `news_${id}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const newsItem = await NewsService.getNewsById(id);
    
    if (!newsItem) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    setCache(cacheKey, newsItem, 1800); // Cache for 30 minutes
    
    res.json(newsItem);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/**
 * GET /api/news/search?q=query
 * Search news
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const cacheKey = `news_search_${q}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const news = await NewsService.searchNews(q, parseInt(limit));
    setCache(cacheKey, news, 1800); // Cache for 30 minutes
    
    res.json(news);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: 'Failed to search news' });
  }
});

/**
 * GET /api/news/recent
 * Get news from last N days
 */
router.get('/recent', async (req, res) => {
  try {
    const { days = 7, limit = 50 } = req.query;
    
    const cacheKey = `news_recent_${days}_${limit}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const news = await NewsService.getRecentNews(parseInt(days), parseInt(limit));
    setCache(cacheKey, news, 1800); // Cache for 30 minutes
    
    res.json(news);
  } catch (error) {
    console.error('Error fetching recent news:', error);
    res.status(500).json({ error: 'Failed to fetch recent news' });
  }
});

module.exports = router;

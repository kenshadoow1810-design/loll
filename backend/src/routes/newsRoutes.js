import express from 'express';
import { fetchAllNews, fetchNewsWithContent } from '../services/newsService.js';
import { fetchNewsContent } from '../services/newsContentService.js';

const router = express.Router();

// GET /api/news - Retorna todas as notícias ou por categoria
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    console.log(`📬 Requisição recebida: /api/news${category ? `?category=${category}` : ''}`);
    
    const news = await fetchAllNews(category || 'all');
    
    console.log(`📤 Respondendo com ${news.length} notícias`);
    
    res.json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro na rota de notícias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar notícias',
      message: error.message,
    });
  }
});

// GET /api/news/categories - Retorna categorias disponíveis
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'all', name: 'Todas', description: 'Todas as notícias de LoL' },
      { id: 'cblol', name: 'CBLOL', description: 'Notícias do Campeonato Brasileiro' },
      { id: 'lck', name: 'LCK', description: 'Notícias da Liga Coreana' },
      { id: 'lpl', name: 'LPL', description: 'Notícias da Liga Chinesa' },
      { id: 'lec', name: 'LEC', description: 'Notícias da Liga Europeia' },
      { id: 'lcs', name: 'LCS', description: 'Notícias da Liga Norte-Americana' },
      { id: 'worlds', name: 'Mundial', description: 'Notícias sobre o Campeonato Mundial' },
    ],
  });
});

// GET /api/news/content?url=<url> - Retorna o conteúdo completo de uma notícia para exibição interna
router.get('/content', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL não fornecida',
        message: 'É necessário fornecer uma URL válida como parâmetro ?url=',
      });
    }
    
    console.log(`📖 Buscando conteúdo da notícia: ${url}`);
    
    const content = await fetchNewsContent(url);
    
    res.json(content);
  } catch (error) {
    console.error('❌ Erro ao buscar conteúdo da notícia:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar conteúdo da notícia',
      message: error.message,
    });
  }
});

// GET /api/news/full/:id - Retorna uma notícia específica com conteúdo completo
router.get('/full/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL não fornecida',
        message: 'É necessário fornecer a URL da notícia como parâmetro ?url=',
      });
    }
    
    console.log(`📖 Buscando notícia completa com ID: ${id}`);
    
    // Cria um objeto básico da notícia
    const newsItem = {
      id,
      url,
      title: req.query.title || 'Notícia',
      summary: req.query.summary || '',
    };
    
    // Busca o conteúdo completo
    const fullNews = await fetchNewsWithContent(newsItem);
    
    res.json({
      success: true,
      data: fullNews,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar notícia completa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar notícia completa',
      message: error.message,
    });
  }
});

export default router;

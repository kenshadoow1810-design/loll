import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Proxy para buscar o conteúdo de uma notícia e extrair apenas o conteúdo principal
 * Isso permite exibir a notícia dentro da aplicação sem redirecionar para sites externos
 */
export async function fetchNewsContent(url) {
  if (!url || url === '#' || url.startsWith('http://news.google.com')) {
    throw new Error('URL inválida para proxy de notícias');
  }

  try {
    console.log(`🌐 Buscando conteúdo da notícia: ${url}`);

    // Faz a requisição com headers de navegador real
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove elementos indesejados
    $('script').remove();
    $('style').remove();
    $('noscript').remove();
    $('iframe').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('.advertisement, .ad, .ads, .banner, .cookie-banner').remove();
    $('[class*="ad-"], [id*="ad-"]').remove();
    $('[class*="social"], [id*="social"]').remove();
    $('[class*="comment"], [id*="comment"]').remove();
    $('[class*="sidebar"], [id*="sidebar"]').remove();
    $('[class*="related"], [id*="related"]').remove();
    // Remove elementos específicos do Google News
    $('c-wiz, nav, header, footer, .wHbD3b, .NIYv2b, .IBr9hb').remove();

    // Tenta encontrar o conteúdo principal do artigo
    let articleContent = null;
    
    // Estratégia 1: Buscar por tags semanticas
    articleContent = $('article').first().html();
    
    // Estratégia 2: Buscar por classes comuns de conteúdo
    if (!articleContent) {
      articleContent = $('[class*="article-content"], [class*="post-content"], [class*="entry-content"], [class*="news-content"]').first().html();
    }
    
    // Estratégia 3: Buscar por ID comum
    if (!articleContent) {
      articleContent = $('#article-content, #post-content, #content, .article-body').first().html();
    }
    
    // Estratégia 4: Se nada funcionou, pega todo o body
    if (!articleContent) {
      articleContent = $('body').html();
    }

    // Extrai título
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }

    // Extrai imagem principal
    let imageUrl = null;
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      imageUrl = ogImage;
    } else {
      const firstImg = $('img').first().attr('src');
      if (firstImg) {
        imageUrl = firstImg;
      }
    }

    // Extrai data de publicação
    let publishedAt = null;
    const timeElement = $('time').first().attr('datetime');
    if (timeElement) {
      publishedAt = timeElement;
    } else {
      const metaDate = $('meta[property="article:published_time"]').attr('content');
      if (metaDate) {
        publishedAt = metaDate;
      }
    }

    // Extrai autor
    let author = null;
    const authorElement = $('[class*="author"], [rel="author"]').first();
    if (authorElement.length) {
      author = authorElement.text().trim();
    } else {
      const metaAuthor = $('meta[name="author"]').attr('content');
      if (metaAuthor) {
        author = metaAuthor;
      }
    }

    return {
      success: true,
      data: {
        url,
        title,
        content: articleContent || '<p>Conteúdo não disponível</p>',
        imageUrl,
        publishedAt,
        author,
        source: new URL(url).hostname,
      },
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar conteúdo da notícia: ${error.message}`);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo limite excedido ao carregar a notícia');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Acesso negado pelo site de origem');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Notícia não encontrada');
    }
    
    throw new Error(`Erro ao carregar notícia: ${error.message}`);
  }
}

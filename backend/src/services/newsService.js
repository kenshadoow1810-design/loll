import Parser from 'rss-parser';

// Configuração do parser com headers personalizados para evitar bloqueios
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['dc:creator', 'author'],
      ['enclosure', 'enclosureData'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

// Feeds RSS públicos e confiáveis para League of Legends
const RSS_FEEDS = {
  // Dot Esports - League of Legends (geral)
  all: 'https://www.dotesports.com/feed/league-of-legends',
  // CBLOL - Google News Brasil
  cblol: 'https://news.google.com/rss/search?q=CBLOL+League+of+Legends&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  // LCK - Coreia
  lck: 'https://news.google.com/rss/search?q=LCK+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // LPL - China
  lpl: 'https://news.google.com/rss/search?q=LPL+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // LEC - Europa
  lec: 'https://news.google.com/rss/search?q=LEC+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // LCS - América do Norte
  lcs: 'https://news.google.com/rss/search?q=LCS+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // Mundial - Google News
  worlds: 'https://news.google.com/rss/search?q=Worlds+League+of+Legends+Championship&hl=en-US&gl=US&ceid=US:en',
};

export async function fetchNewsFromRSS(feedUrl, category) {
  try {
    console.log(`📡 Buscando feed RSS: ${feedUrl} (categoria: ${category})`);
    
    const feed = await parser.parseURL(feedUrl);
    
    if (!feed || !feed.items || feed.items.length === 0) {
      console.warn(`⚠️ Feed vazio para ${category}`);
      return [];
    }
    
    console.log(`✅ Encontrados ${feed.items.length} itens no feed de ${category}`);
    
    return feed.items.map((item, index) => {
      // Extrair imagem de várias fontes possíveis
      let imageUrl = null;
      
      // Prioridade 1: enclosure
      if (item.enclosureData?.url) {
        imageUrl = item.enclosureData.url;
      } 
      // Prioridade 2: media:content
      else if (item.mediaContent?.[0]?.$?.url) {
        imageUrl = item.mediaContent[0].$.url;
      } 
      // Prioridade 3: media:thumbnail
      else if (item.mediaThumbnail?.[0]?.$?.url) {
        imageUrl = item.mediaThumbnail[0].$.url;
      } 
      // Prioridade 4: image tag padrão
      else if (item.image?.url) {
        imageUrl = item.image.url;
      } 
      // Prioridade 5: extrair do conteúdo HTML
      else if (item.content && item.content.match(/<img[^>]+src="([^"]+)"/)) {
        const match = item.content.match(/<img[^>]+src="([^"]+)"/);
        imageUrl = match[1];
      }
      
      // Imagem fallback se nenhuma foi encontrada
      if (!imageUrl) {
        imageUrl = 'https://images.contentstack.io/v3/assets/blt5a5281f9e974de16/blt341f1c6c6b96d8f4/61e4c7f6e0a2f70c0c6f8b8a/LoL_2022_Splash_Art.jpg';
      }

      // Extrair resumo do conteúdo
      let summary = '';
      if (item.contentSnippet) {
        summary = item.contentSnippet;
      } else if (item.description) {
        // Remover tags HTML do description
        summary = item.description.replace(/<[^>]*>/g, '').substring(0, 200);
      } else if (item.content) {
        summary = item.content.replace(/<[^>]*>/g, '').substring(0, 200);
      }
      
      // Extrair autor
      let author = item.author || item.dc_creator || 'Dot Esports';
      
      // Formatar data
      const publishedDate = new Date(item.pubDate || Date.now());
      const now = new Date();
      const diffMs = now - publishedDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 1) timeAgo = 'Agora mesmo';
      else if (diffMins < 60) timeAgo = `há ${diffMins} min`;
      else if (diffHours < 24) timeAgo = `há ${diffHours}h`;
      else if (diffDays < 7) timeAgo = `há ${diffDays}d`;
      else timeAgo = publishedDate.toLocaleDateString('pt-BR');

      // Determinar categoria baseada no conteúdo
      const titleLower = (item.title || '').toLowerCase();
      let newsCategory = 'Geral';
      let league = null;

      if (titleLower.includes('cblol') || titleLower.includes('brasil') || titleLower.includes('loud') || titleLower.includes('pain') || titleLower.includes('kabum') || titleLower.includes('furia') || titleLower.includes('red')) {
        newsCategory = 'CBLOL';
        league = 'CBLOL';
      } else if (titleLower.includes('patch') || titleLower.includes('update') || titleLower.includes('nerf') || titleLower.includes('buff')) {
        newsCategory = 'Patches';
      } else if (titleLower.includes('lck') || titleLower.includes('lec') || titleLower.includes('lcs') || titleLower.includes('lpl')) {
        newsCategory = 'Internacional';
        league = 'INTERNATIONAL';
      } else if (titleLower.includes('worlds') || titleLower.includes('mundial') || titleLower.includes('championship')) {
        newsCategory = 'Mundial';
        league = 'WORLD';
      }

      return {
        id: `${category}-${index}-${Date.now()}`,
        title: item.title || 'Sem título',
        summary: summary || 'Sem descrição disponível',
        url: item.link || '#',
        source: category === 'cblol' || category === 'international' || category === 'worlds' ? 'Inven Global' : 'Dot Esports',
        category: newsCategory,
        league,
        publishedAt: item.pubDate || new Date().toISOString(),
        date: timeAgo,
        img: imageUrl,
        author: author,
      };
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar RSS de ${category}:`, error.message);
    console.error(`   URL: ${feedUrl}`);
    return [];
  }
}

export async function fetchAllNews(category = 'all') {
  if (category !== 'all' && !RSS_FEEDS[category]) {
    throw new Error(`Categoria inválida: ${category}. Categorias disponíveis: ${Object.keys(RSS_FEEDS).join(', ')}`);
  }

  // Se for uma categoria específica, busca apenas daquele feed
  if (category !== 'all') {
    const news = await fetchNewsFromRSS(RSS_FEEDS[category], category);
    return news.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );
  }

  // Para "all", busca de múltiplas fontes e combina
  console.log('🔄 Buscando todas as categorias de notícias...');
  
  const [general, cblol, lck, lpl, lec, lcs] = await Promise.all([
    fetchNewsFromRSS(RSS_FEEDS.all, 'all'),
    fetchNewsFromRSS(RSS_FEEDS.cblol, 'cblol'),
    fetchNewsFromRSS(RSS_FEEDS.lck, 'lck'),
    fetchNewsFromRSS(RSS_FEEDS.lpl, 'lpl'),
    fetchNewsFromRSS(RSS_FEEDS.lec, 'lec'),
    fetchNewsFromRSS(RSS_FEEDS.lcs, 'lcs')
  ]);

  // Combina todos os resultados
  const allNews = [...general, ...cblol, ...lck, ...lpl, ...lec, ...lcs];

  // Remove duplicatas baseado na URL
  const uniqueNews = allNews.filter((news, index, self) => 
    index === self.findIndex(n => n.url === news.url)
  );

  console.log(`📰 Total de notícias únicas: ${uniqueNews.length}`);

  // Ordena por data (mais recente primeiro)
  return uniqueNews.sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

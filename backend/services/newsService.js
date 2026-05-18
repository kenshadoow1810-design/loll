import Parser from 'rss-parser';

// Configuração do parser com headers personalizados para evitar bloqueios
const parser = new Parser({
  customFields: {
    item: ['enclosure', 'image', 'content:encoded', 'media:content', 'description', 'link']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

// Feeds RSS públicos e gratuitos para League of Legends
const RSS_FEEDS = {
  // Google News - League of Legends (geral)
  all: 'https://news.google.com/rss/search?q=League+of+Legends&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  // Google News - CBLOL (Brasil)
  cblol: 'https://news.google.com/rss/search?q=CBLOL&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  // Google News - LCK (Coreia)
  lck: 'https://news.google.com/rss/search?q=LCK+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // Google News - LPL (China)
  lpl: 'https://news.google.com/rss/search?q=LPL+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // Google News - LEC (Europa)
  lec: 'https://news.google.com/rss/search?q=LEC+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // Google News - LCS (América do Norte)
  lcs: 'https://news.google.com/rss/search?q=LCS+League+of+Legends&hl=en-US&gl=US&ceid=US:en',
  // Google News - Mundial de LoL
  worlds: 'https://news.google.com/rss/search?q=Worlds+League+of+Legends+Championship&hl=en-US&gl=US&ceid=US:en'
};

async function fetchNewsFromRSS(feedUrl, category) {
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
      
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } else if (item.image?.url) {
        imageUrl = item.image.url;
      } else if (item['media:content']?.['$']?.url) {
        imageUrl = item['media:content']['$'].url;
      } else if (item['media:content']?.url) {
        imageUrl = item['media:content'].url;
      } else if (item.content?.match(/<img[^>]+src="([^"]+)"/)) {
        const match = item.content.match(/<img[^>]+src="([^"]+)"/);
        imageUrl = match[1];
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
      let author = 'Google News';
      if (item.author) {
        author = item.author;
      } else if (item.dc_creator) {
        author = item.dc_creator;
      }
      
      // Google News usa link diferente
      let url = item.link || '#';
      if (url.startsWith('http')) {
        url = item.link;
      } else if (item.guid) {
        url = item.guid;
      }
      
      return {
        id: `${category}-${index}-${Date.now()}`,
        title: item.title || 'Sem título',
        url: url,
        source: 'Google News',
        category: category,
        publishedAt: item.pubDate || new Date().toISOString(),
        summary: summary || 'Sem descrição disponível',
        imageUrl: imageUrl,
        author: author
      };
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar RSS de ${category}:`, error.message);
    console.error(`   URL: ${feedUrl}`);
    console.error(`   Stack:`, error.stack?.split('\n')[1]);
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

export { fetchNewsFromRSS, RSS_FEEDS };

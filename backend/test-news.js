import { fetchAllNews } from './services/newsService.js';

console.log('🧪 Testando o serviço de notícias...\n');

async function testNewsService() {
  try {
    console.log('1️⃣ Testando todas as notícias (categoria: all)...');
    const allNews = await fetchAllNews('all');
    console.log(`✅ Sucesso! ${allNews.length} notícias encontradas.\n`);
    
    if (allNews.length > 0) {
      console.log('📰 Primeira notícia:');
      console.log(`   Título: ${allNews[0].title}`);
      console.log(`   URL: ${allNews[0].url}`);
      console.log(`   Fonte: ${allNews[0].source}`);
      console.log(`   Categoria: ${allNews[0].category}`);
      console.log(`   Data: ${allNews[0].publishedAt}`);
      console.log(`   Imagem: ${allNews[0].imageUrl || 'Sem imagem'}\n`);
    }
    
    console.log('2️⃣ Testando notícias do CBLOL...');
    const cblolNews = await fetchAllNews('cblol');
    console.log(`✅ Sucesso! ${cblolNews.length} notícias do CBLOL encontradas.\n`);
    
    if (cblolNews.length > 0) {
      console.log('📰 Primeira notícia do CBLOL:');
      console.log(`   Título: ${cblolNews[0].title}`);
      console.log(`   URL: ${cblolNews[0].url}\n`);
    }
    
    console.log('3️⃣ Testando notícias da LCK...');
    const lckNews = await fetchAllNews('lck');
    console.log(`✅ Sucesso! ${lckNews.length} notícias da LCK encontradas.\n`);
    
    if (lckNews.length > 0) {
      console.log('📰 Primeira notícia da LCK:');
      console.log(`   Título: ${lckNews[0].title}\n`);
    }
    
    console.log('4️⃣ Testando notícias da LEC...');
    const lecNews = await fetchAllNews('lec');
    console.log(`✅ Sucesso! ${lecNews.length} notícias da LEC encontradas.\n`);
    
    console.log('5️⃣ Testando notícias da LCS...');
    const lcsNews = await fetchAllNews('lcs');
    console.log(`✅ Sucesso! ${lcsNews.length} notícias da LCS encontradas.\n`);
    
    console.log('6️⃣ Testando notícias da LPL...');
    const lplNews = await fetchAllNews('lpl');
    console.log(`✅ Sucesso! ${lplNews.length} notícias da LPL encontradas.\n`);
    
    console.log('7️⃣ Testando notícias do Mundial...');
    const worldsNews = await fetchAllNews('worlds');
    console.log(`✅ Sucesso! ${worldsNews.length} notícias do Mundial encontradas.\n`);
    
    console.log('🎉 Todos os testes passaram!\n');
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testNewsService();

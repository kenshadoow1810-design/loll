import { useState, useEffect } from 'react';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNews();
  }, [filter]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? 'http://localhost:3001/api/news?limit=20'
        : `http://localhost:3001/api/news?category=${filter}&limit=20`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNews(data || []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-400">Carregando notícias...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gradient">📰 Notícias do Cenário</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'all' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('CBLOL')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'CBLOL' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          CBLOL
        </button>
        <button
          onClick={() => setFilter('LCS')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'LCS' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          LCS
        </button>
        <button
          onClick={() => setFilter('LEC')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'LEC' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          LEC
        </button>
        <button
          onClick={() => setFilter('LCK')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'LCK' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          LCK
        </button>
        <button
          onClick={() => setFilter('LPL')}
          className={`px-4 py-2 rounded transition-colors ${
            filter === 'LPL' 
              ? 'bg-lol-gold text-black font-semibold' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          LPL
        </button>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-xl">Nenhuma notícia disponível</p>
          <p className="text-sm mt-2">As notícias serão atualizadas periodicamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-lol-gold transition-all hover:shadow-xl group"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:opacity-80 transition-opacity"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-800 px-2 py-1 rounded">
                    {item.source || 'Fonte desconhecida'}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(item.published_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-lol-gold transition-colors">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {item.summary}
                  </p>
                )}
                <div className="flex items-center text-lol-gold text-sm font-semibold">
                  Ler mais →
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;

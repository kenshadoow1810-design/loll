import { useState, useEffect } from 'react';
import { NewsGrid } from '../components/news/NewsCard';
import { api } from '../services/api';

export function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await api.getNews();
        setNews(data);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Notícias do Cenário
          </span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-shimmer h-80 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <NewsGrid news={news} />
        )}
      </div>
    </div>
  );
}

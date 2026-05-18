import { useState, useEffect } from 'react';
import { NewsGrid } from '../components/news/NewsCard';
import { NewsReaderModal } from '../components/news/NewsReaderModal';
import { api } from '../services/api';

export function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getNewsCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const data = await api.getNews(selectedCategory);
        setNews(data);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, [selectedCategory]);

  const handleOpenNews = (newsItem) => {
    setSelectedNews(newsItem);
  };

  const handleCloseNews = () => {
    setSelectedNews(null);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Notícias do Cenário
          </span>
        </h1>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25'
                  : 'bg-dark-100 text-gray-400 hover:text-white hover:bg-dark-200 border border-gray-700/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-shimmer h-80 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <NewsGrid news={news} onOpenNews={handleOpenNews} />
        )}

        {/* Modal de Leitura da Notícia */}
        {selectedNews && (
          <NewsReaderModal 
            news={selectedNews} 
            onClose={handleCloseNews} 
          />
        )}
      </div>
    </div>
  );
}

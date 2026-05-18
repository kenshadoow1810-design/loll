import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function NewsReaderModal({ news, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!news?.url) {
        // Se não tiver URL, usa o conteúdo direto do objeto news
        setContent({
          title: news?.title || 'Notícia',
          content: news?.fullContent || news?.summary || news?.description || 'Conteúdo não disponível',
          imageUrl: news?.img || news?.imageUrl,
          publishedAt: news?.date || news?.publishedAt,
          author: news?.author,
          source: news?.source || 'Desconhecido'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getNewsContent(news.url);
        
        if (data) {
          setContent(data);
          setError(null);
        } else {
          // Fallback: usa conteúdo disponível no objeto news quando a API retorna null
          setContent({
            title: news?.title || 'Notícia',
            content: news?.fullContent || news?.summary || news?.description || 'Carregando conteúdo...',
            imageUrl: news?.img || news?.imageUrl,
            publishedAt: news?.date || news?.publishedAt,
            author: news?.author,
            source: news?.source || 'Desconhecido'
          });
          setError(null);
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        // Fallback: usa conteúdo disponível no objeto news
        setContent({
          title: news?.title || 'Notícia',
          content: news?.fullContent || news?.summary || news?.description || 'Conteúdo não disponível',
          imageUrl: news?.img || news?.imageUrl,
          publishedAt: news?.date || news?.publishedAt,
          author: news?.author,
          source: news?.source || 'Desconhecido'
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [news]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-100 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/30 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 bg-gold-600/20 text-gold-400 rounded-full font-semibold uppercase">
              {news?.category || 'Notícia'}
            </span>
            <span className="text-xs text-gray-500">
              {news?.source || 'Fonte externa'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-64 bg-dark-200 rounded-xl"></div>
              <div className="h-8 bg-dark-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-dark-200 rounded"></div>
                <div className="h-4 bg-dark-200 rounded"></div>
                <div className="h-4 bg-dark-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : content ? (
            <article className="prose prose-invert max-w-none">
              {content.imageUrl && (
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              <h1 className="text-2xl font-bold text-white mb-4">
                {content.title}
              </h1>
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Conteúdo não disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

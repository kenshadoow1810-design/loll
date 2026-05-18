import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function NewsReaderModal({ news, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!news?.url) {
        setError('URL da notícia não disponível');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getNewsContent(news.url);
        setContent(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        setError(err.message || 'Erro ao carregar conteúdo da notícia');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [news]);

  // Se a URL for do Google News ou inválida, abre em nova aba
  const shouldOpenExternal = !news?.url || 
    news.url.includes('news.google.com') || 
    news.url === '#';

  const handleOpenExternal = () => {
    if (news?.url && news.url !== '#') {
      window.open(news.url, '_blank', 'noopener,noreferrer');
    }
  };

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
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
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
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Não foi possível carregar o conteúdo
              </h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleOpenExternal}
                className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
              >
                Abrir no navegador externo
              </button>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/30 flex justify-between items-center">
          <a
            href={news?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Abrir original
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-200 text-gray-300 rounded-lg hover:bg-dark-300 transition-colors text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

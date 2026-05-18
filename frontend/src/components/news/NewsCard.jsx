export function NewsCard({ news, onOpenNews }) {
  // Mapeamento de categorias para nomes amigáveis
  const categoryMap = {
    cblol: 'CBLOL',
    lck: 'LCK',
    lpl: 'LPL',
    lec: 'LEC',
    lcs: 'LCS',
    worlds: 'Mundial',
    all: 'Geral'
  };

  const displayCategory = categoryMap[news.league?.toLowerCase()] || news.category || 'Geral';

  return (
    <div
      onClick={() => onOpenNews(news)}
      className="bg-dark-100 border border-gray-700/30 rounded-2xl overflow-hidden card-hover cursor-pointer group block"
    >
      <div className="h-44 overflow-hidden">
        <img
          src={news.img || news.imageUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 340%22><rect fill=%22%231A1C23%22 width=%22600%22 height=%22340%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23785A28%22 font-size=%2240%22>📰</text></svg>'}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 340%22><rect fill=%22%231A1C23%22 width=%22600%22 height=%22340%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23785A28%22 font-size=%2240%22>📰</text></svg>';
          }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 bg-gold-600/20 text-gold-400 rounded-full font-semibold uppercase">
            {displayCategory}
          </span>
          <span className="text-[10px] text-gray-500">
            {news.date || new Date(news.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">
          {news.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{news.summary || news.description}</p>
      </div>
    </div>
  );
}

export function NewsGrid({ news, title, onOpenNews }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3">
        <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
          {title || 'Últimas Notícias'}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <NewsCard key={item.id || item.title} news={item} onOpenNews={onOpenNews} />
        ))}
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { MatchesFeed } from '../components/matches/MatchCard';
import { api } from '../services/api';

export function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await api.getRecentMatches();
        setMatches(data);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const filteredMatches = filter === 'all' 
    ? matches 
    : matches.filter(m => m.win === (filter === 'win'));

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Partidas Recentes
          </span>
        </h1>

        {/* Filter */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gold-600/20 text-gold-400 border border-gold-600/40'
                : 'bg-dark-100 text-gray-400 border border-gray-700/30 hover:border-gold-600/40'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'win'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-dark-100 text-gray-400 border border-gray-700/30 hover:border-green-500/40'
            }`}
          >
            Vitórias
          </button>
          <button
            onClick={() => setFilter('loss')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'loss'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-dark-100 text-gray-400 border border-gray-700/30 hover:border-red-500/40'
            }`}
          >
            Derrotas
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-shimmer h-20 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <MatchesFeed matches={filteredMatches} />
        )}

        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma partida encontrada
          </div>
        )}
      </div>
    </div>
  );
}

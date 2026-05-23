import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await api.getAllPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.league.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            {t('allPlayers')}
          </span>
        </h1>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder={t('searchByNameTeamOrLeague')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
          />
        </div>

        {loading ? (
          <div className="animate-shimmer h-96 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map(player => (
              <Link
                key={player.id}
                to={`/player/${player.id}/${player.league}`}
                className="bg-dark-100 border border-gray-700/30 rounded-xl p-4 hover:bg-dark-200/50 transition-all cursor-pointer block"
              >
                <div className="flex items-center gap-4">
                  {player.image_url ? (
                    <img
                      src={player.image_url}
                      alt={player.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center text-2xl">
                      🎮
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.team} • {player.league} • {player.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">KDA</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('noPlayersFound')} "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}

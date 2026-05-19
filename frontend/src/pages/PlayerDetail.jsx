import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function PlayerDetail() {
  const { playerId, league } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true);
      try {
        const playerData = await api.getPlayer(playerId, league);
        
        if (!playerData) {
          navigate('/players');
          return;
        }
        
        setPlayer(playerData);
      } catch (error) {
        console.error('Error loading player:', error);
        navigate('/players');
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [playerId, league, navigate]);

  if (loading) {
    return (
      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-shimmer h-96 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!player) return null;

  const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Player Header */}
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl overflow-hidden">
          <div className="relative p-6 pb-4 border-b border-gray-700/30">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-dark-200 hover:bg-dark-300 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border-2 border-gold-600/40 flex items-center justify-center text-3xl">
                {player.teamLogo}
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-white">{player.name}</h2>
                <p className="text-gold-400 font-medium">{player.team}</p>
                <div className="flex gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-dark-200 rounded text-xs text-gray-400">{player.league}</span>
                  <span className="px-2 py-0.5 bg-dark-200 rounded text-xs text-gray-400">{player.region}</span>
                  <span className="px-2 py-0.5 bg-dark-200 rounded text-xs text-gray-400">{player.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
            <div className="bg-dark-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">KDA</div>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 text-center">
              <div className={`text-2xl font-display font-bold ${wrColor}`}>{player.wr}%</div>
              <div className="text-xs text-gray-500 mt-1">Win Rate</div>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-accent-blue">{player.csPerMin.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-1">CS/Média</div>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-accent-red">{player.kp}%</div>
              <div className="text-xs text-gray-500 mt-1">Kill Participation</div>
            </div>
          </div>

          {/* Message about champions data */}
          <div className="px-6 pb-6">
            <div className="bg-dark-200 rounded-xl p-6 text-center">
              <p className="text-gray-400">Dados de campeões serão disponíveis em breve.</p>
              <p className="text-sm text-gray-500 mt-2">Esta funcionalidade será implementada quando a pipeline de scraping for atualizada com os links das estatísticas de campeões.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


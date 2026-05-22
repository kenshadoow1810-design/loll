import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

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

  // Calcular wins e losses baseado no winrate e games
  const wins = Math.round((player.wr / 100) * player.games);
  const losses = player.games - wins;
  
  const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';

  // Preparar dados para o gráfico de radar
  const radarData = [
    { stat: 'KDA', value: Math.min(player.kda, 10), fullMark: 10 },
    { stat: 'WR', value: player.wr / 10, fullMark: 10 },
    { stat: 'KP', value: player.kp / 10, fullMark: 10 },
    { stat: 'CS', value: Math.min((player.csPerMin || 5) / 1, 10), fullMark: 10 },
  ];

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Player Header */}
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl overflow-hidden">
          <div className="relative p-6 pb-4 border-b border-gray-700/30">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-dark-200 hover:bg-dark-300 text-gray-400 hover:text-white transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Player Image - Left Side, Larger */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                {player.image_url ? (
                  <img
                    src={player.image_url}
                    alt={player.name}
                    className="w-64 h-64 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center text-4xl">
                    {player.teamLogo}
                  </div>
                )}
              </div>

              <div className="flex-1 pt-2">
                <div>
                  <h2 className="font-display font-bold text-3xl text-white">{player.name}</h2>
                  {player.real_name && (
                    <p className="text-sm text-gray-400 mt-1">{player.real_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {player.team_logo_url && (
                      <img
                        src={player.team_logo_url}
                        alt={player.team}
                        className="w-5 h-5 object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <p className="text-gold-400 font-medium">{player.team}</p>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <span className="px-2 py-1 bg-dark-200 rounded-md text-xs text-gray-400">{player.league}</span>
                    <span className="px-2 py-1 bg-dark-200 rounded-md text-xs text-gray-400">{player.region}</span>
                    <span className="px-2 py-1 bg-dark-200 rounded-md text-xs text-gray-400">{player.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Stats Grid */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white mb-4">Estatísticas Principais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">KDA</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className={`text-3xl font-display font-bold ${wrColor}`}>{player.wr}%</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Win Rate</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-accent-blue">{player.csPerMin?.toFixed(1) || 'N/A'}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">CS/Média</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-accent-red">{player.kp}%</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Kill Participation</div>
                </div>
              </div>

              <div className="bg-dark-200 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-white">{player.games}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Partidas Jogadas</div>
                </div>
              </div>

              {/* Wins e Losses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-green-400">{wins}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Vitórias</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-red-400">{losses}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Derrotas</div>
                </div>
              </div>
            </div>

            {/* Gráfico de Radar */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-display font-bold text-lg text-white mb-4 text-center">Radar de Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="stat" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Radar
                      name={player.name}
                      dataKey="value"
                      stroke="#D4AF37"
                      strokeWidth={3}
                      fill="#D4AF37"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
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

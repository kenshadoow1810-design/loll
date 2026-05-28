import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export function PlayerDetail() {
  const { playerId, league } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

  const wins = Math.round((player.wr / 100) * player.games);
  const losses = player.games - wins;

  const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';

  const radarData = {
    labels: ['KDA', 'CS/min', 'KP%', 'WR%', 'DPM', 'Gold per Min'],
    datasets: [
      {
        label: player.name,
        data: [
          player.kda,
          (player.csPerMin || 0) * 10,
          player.kp,
          player.wr,
          (player.damage || 0) / 500,
          (player.gold || 0) / 200,
        ],
        backgroundColor: 'rgba(240, 192, 64, 0.2)',
        borderColor: 'rgba(240, 192, 64, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(240, 192, 64, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF', font: { size: 12 } },
      },
      title: {
        display: true,
        text: t('performanceRadar'),
        color: '#F0C040',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(55, 65, 81, 0.5)' },
        grid: { color: 'rgba(55, 65, 81, 0.5)' },
        pointLabels: { color: '#9CA3AF', font: { size: 11 } },
        ticks: { display: false },
      },
    },
  };

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {}
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

            {}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <img
                  src={player.image_url || 'https://static.lolesports.com/players/1675150271520_placeholder.png'}
                  alt={player.name}
                  className="w-64 h-64 rounded-2xl object-cover"
                />
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
            {}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white mb-4">{t('mainStats')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">KDA</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className={`text-3xl font-display font-bold ${wrColor}`}>{player.wr}%</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('winRate')}</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-accent-blue">{player.csPerMin?.toFixed(1) || 'N/A'}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('csPerMin')}</div>
                </div>
                <div className="bg-dark-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display font-bold text-accent-red">{player.kp}%</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('killParticipation')}</div>
                </div>
              </div>

              <div className="bg-dark-200 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-white">{player.games}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('gamesPlayed')}</div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-green-400">{wins}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('wins')}</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-red-400">{losses}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{t('losses')}</div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-dark-200 rounded-xl p-4 h-96">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {}
          <div className="px-6 pb-6">
            <div className="bg-dark-200 rounded-xl p-6 text-center">
              <p className="text-gray-400">{t('championsDataSoon')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('functionalityNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

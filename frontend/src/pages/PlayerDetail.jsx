import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { api } from '../services/api';

export function PlayerDetail() {
  const { playerId, league } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const kdaChartRef = useRef(null);
  const damageChartRef = useRef(null);
  const chartInstances = useRef({});

  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true);
      try {
        const [playerData, matchesData] = await Promise.all([
          api.getPlayer(playerId, league),
          api.getPlayerMatches(playerId, league),
        ]);
        
        if (!playerData) {
          navigate('/players');
          return;
        }
        
        setPlayer(playerData);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading player:', error);
        navigate('/players');
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [playerId, league, navigate]);

  useEffect(() => {
    if (!player || !kdaChartRef.current || !damageChartRef.current) return;

    Chart.defaults.color = '#9CA3AF';
    Chart.defaults.borderColor = 'rgba(120,90,40,0.15)';
    Chart.defaults.font.family = 'Inter';

    const matchLabels = matches.map((_, i) => `#${i + 1}`);
    const kdaData = matches.map(m => ((m.kills + m.assists) / Math.max(m.deaths, 1)).toFixed(2));
    const dmgData = matches.map(m => m.damage);

    // KDA Chart
    chartInstances.current.kda = new Chart(kdaChartRef.current, {
      type: 'line',
      data: {
        labels: matchLabels,
        datasets: [{
          label: 'KDA',
          data: kdaData,
          borderColor: '#F0C040',
          backgroundColor: 'rgba(240,192,64,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#F0C040',
          pointBorderColor: '#0A0B0E',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
      }
    });

    // Damage Chart
    chartInstances.current.damage = new Chart(damageChartRef.current, {
      type: 'bar',
      data: {
        labels: matchLabels,
        datasets: [{
          label: 'Dano',
          data: dmgData,
          backgroundColor: 'rgba(10,200,185,0.4)',
          borderColor: '#0AC8B9',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [player, matches]);

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

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">KDA por Partida</h3>
              <canvas ref={kdaChartRef} height="200"></canvas>
            </div>
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Dano por Partida</h3>
              <canvas ref={damageChartRef} height="200"></canvas>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Últimas Partidas</h3>
            <div className="space-y-2">
              {matches.map(match => {
                const kdaStr = `${match.kills}/${match.deaths}/${match.assists}`;
                const kdaVal = ((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2);
                return (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      match.win ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg ${match.win ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center text-xs">
                        {match.win ? '🏆' : '❌'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{match.champion}</div>
                        <div className="text-xs text-gray-500">{match.duration}min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-mono ${match.win ? 'text-green-400' : 'text-red-400'}`}>{kdaStr}</div>
                      <div className="text-xs text-gray-500">KDA: {kdaVal}</div>
                    </div>
                    <div className="hidden sm:block text-right text-xs text-gray-500">
                      <div>{match.cs} CS</div>
                      <div>{(match.damage / 1000).toFixed(1)}k dmg</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


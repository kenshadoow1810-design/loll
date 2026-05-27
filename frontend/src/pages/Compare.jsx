import { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export function Compare() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await api.getAllPlayers();
        setAllPlayers(data);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const player1 = allPlayers.find(p => p.id === player1Id);
  const player2 = allPlayers.find(p => p.id === player2Id);

  const radarData = {
    labels: ['KDA', 'CS/min', 'KP%', 'WR%', 'DPM', 'Gold per Min'],
    datasets: [
      {
        label: player1?.name || 'Player 1',
        data: player1 ? [
          player1.kda,
          player1.csPerMin * 10,
          player1.kp,
          player1.wr,
          player1.damage / 500,
          player1.gold / 200,
        ] : [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(240, 192, 64, 0.2)',
        borderColor: 'rgba(240, 192, 64, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(240, 192, 64, 1)',
      },
      {
        label: player2?.name || 'Player 2',
        data: player2 ? [
          player2.kda,
          player2.csPerMin * 10,
          player2.kp,
          player2.wr,
          player2.damage / 500,
          player2.gold / 200,
        ] : [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(10, 200, 185, 0.2)',
        borderColor: 'rgba(10, 200, 185, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(10, 200, 185, 1)',
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
        text: t('statsComparison'),
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

  if (loading) {
    return (
      <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-shimmer h-96 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            {t('comparePlayers')}
          </span>
        </h1>

        {}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('player1')}</label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full bg-dark-100 border border-gray-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-600/40"
            >
              <option value="">{t('select')}</option>
              {allPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.team}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('player2')}</label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full bg-dark-100 border border-gray-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-600/40"
            >
              <option value="">{t('select')}</option>
              {allPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.team}</option>
              ))}
            </select>
          </div>
        </div>

        {player1 && player2 && (
          <>
            {}
            <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 mb-8 h-96">
              <Radar data={radarData} options={radarOptions} />
            </div>

            {}
            <div className="grid md:grid-cols-3 gap-6">
              {}
              <div className="bg-gradient-to-br from-gold-600/10 to-dark-100 border border-gold-600/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  {player1.image_url ? (
                    <img
                      src={player1.image_url}
                      alt={player1.name}
                      className="w-16 h-16 rounded-full object-cover border border-gold-600/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-600/30 flex items-center justify-center text-2xl">
                      {player1.teamLogo}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{player1.name}</h3>
                    <p className="text-gray-400 text-sm">{player1.team} • {player1.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <StatRow label="KDA" value={player1.kda.toFixed(2)} />
                  <StatRow label="CS/min" value={player1.csPerMin.toFixed(1)} />
                  <StatRow label="KP%" value={`${player1.kp}%`} />
                  <StatRow label="WR%" value={`${player1.wr}%`} highlight={player1.wr >= 60} />
                  <StatRow label="Partidas" value={player1.games} />
                </div>
              </div>

              {}
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-dark-200 border border-gray-700/30 flex items-center justify-center">
                  <span className="font-display font-black text-2xl text-gray-500">VS</span>
                </div>
              </div>

              {}
              <div className="bg-gradient-to-br from-accent-blue/10 to-dark-100 border border-accent-blue/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  {player2.image_url ? (
                    <img
                      src={player2.image_url}
                      alt={player2.name}
                      className="w-16 h-16 rounded-full object-cover border border-accent-blue/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-blue/30 border border-accent-blue/30 flex items-center justify-center text-2xl">
                      {player2.teamLogo}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{player2.name}</h3>
                    <p className="text-gray-400 text-sm">{player2.team} • {player2.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <StatRow label="KDA" value={player2.kda.toFixed(2)} />
                  <StatRow label="CS/min" value={player2.csPerMin.toFixed(1)} />
                  <StatRow label="KP%" value={`${player2.kp}%`} />
                  <StatRow label="WR%" value={`${player2.wr}%`} highlight={player2.wr >= 60} />
                  <StatRow label="Partidas" value={player2.games} />
                </div>
              </div>
            </div>
          </>
        )}

        {!player1 && !player2 && (
          <div className="text-center py-16 text-gray-500">
            {t('selectTwoPlayers')}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/20 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-display font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

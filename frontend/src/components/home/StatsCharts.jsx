import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { api } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export function TopChampionsChart() {
  const [championStats, setChampionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadChampionStats = async () => {
      try {
        // LINK_DO_CAMPION_AQUI - Dados serão populados quando os links dos campeões forem fornecidos
        const data = await api.getChampionStats();
        setChampionStats(data);
      } catch (error) {
        console.error('Error loading champion stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChampionStats();
  }, []);

  if (loading || championStats.length === 0) {
    return (
      <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-sm">
          {loading ? 'Carregando estatísticas...' : 'Dados de campeões serão disponíveis em breve. Aguardando links para scraping.'}
        </div>
      </div>
    );
  }
  
  // Count champion games by role
  const champStats = {};
  championStats.forEach(champ => {
    if (!champStats[champ.championName]) {
      champStats[champ.championName] = { games: 0, wins: 0 };
    }
    champStats[champ.championName].games += champ.gamesPlayed;
    champStats[champ.championName].wins += champ.wins;
  });

  // Sort by games and take top 10
  const topChamps = Object.entries(champStats)
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 10);

  const data = {
    labels: topChamps.map(([name]) => name),
    datasets: [
      {
        label: 'Partidas',
        data: topChamps.map(([, stats]) => stats.games),
        backgroundColor: 'rgba(240, 192, 64, 0.7)',
        borderColor: 'rgba(240, 192, 64, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Vitórias',
        data: topChamps.map(([, stats]) => stats.wins),
        backgroundColor: 'rgba(10, 200, 185, 0.7)',
        borderColor: 'rgba(10, 200, 185, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF', font: { size: 12 } },
      },
      title: {
        display: true,
        text: 'Campeões Mais Jogados - Top 10',
        color: '#F0C040',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF', font: { size: 10 } },
        grid: { color: 'rgba(55, 65, 81, 0.5)' },
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(55, 65, 81, 0.5)' },
      },
    },
  };

  return (
    <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 h-80">
      <Bar data={data} options={options} />
    </div>
  );
}

export function TopKDAChart() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopPlayers = async () => {
      try {
        const data = await api.getTopPlayers(5);
        setTopPlayers(data);
      } catch (error) {
        console.error('Error loading top players:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTopPlayers();
  }, []);

  if (loading || topPlayers.length === 0) {
    return (
      <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Carregando KDA...</div>
      </div>
    );
  }

  const data = {
    labels: topPlayers.map(p => p.name),
    datasets: [
      {
        label: 'KDA',
        data: topPlayers.map(p => p.kda),
        backgroundColor: 'rgba(240, 192, 64, 0.2)',
        borderColor: 'rgba(240, 192, 64, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(240, 192, 64, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'KDA dos Top 5 Jogadores Globais',
        color: '#F0C040',
        font: { size: 16, weight: 'bold' },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F0C040',
        bodyColor: '#fff',
        borderColor: 'rgba(240, 192, 64, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `KDA: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF', font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(55, 65, 81, 0.5)' },
      },
    },
  };

  return (
    <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 h-80">
      <Line data={data} options={options} />
    </div>
  );
}

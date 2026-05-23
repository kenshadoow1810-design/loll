import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export function ChartsSection() {
  const leagueWRChartRef = useRef(null);
  const topKDAChartRef = useRef(null);
  const champPickChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const chartInstances = useRef({});

  useEffect(() => {
    Chart.defaults.color = '#9CA3AF';
    Chart.defaults.borderColor = 'rgba(120,90,40,0.15)';
    Chart.defaults.font.family = 'Inter';

    if (leagueWRChartRef.current) {
      chartInstances.current.leagueWR = new Chart(leagueWRChartRef.current, {
        type: 'bar',
        data: {
          labels: ['CBLOL', 'LCK', 'LEC', 'LCS', 'LPL'],
          datasets: [{
            label: 'Winrate Médio %',
            data: [52.3, 58.1, 54.7, 50.2, 56.8],
            backgroundColor: ['rgba(240,192,64,0.6)', 'rgba(10,200,185,0.6)', 'rgba(123,47,190,0.6)', 'rgba(232,64,87,0.6)', 'rgba(240,192,64,0.4)'],
            borderColor: ['#F0C040', '#0AC8B9', '#7B2FBE', '#E84057', '#C89B3C'],
            borderWidth: 2,
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 70, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
        }
      });
    }

    if (topKDAChartRef.current) {
      chartInstances.current.topKDA = new Chart(topKDAChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Faker', 'Chovy', 'Caps', 'Knight', 'Jensen'],
          datasets: [{
            label: 'KDA',
            data: [7.8, 7.2, 6.5, 6.9, 5.8],
            backgroundColor: 'rgba(240,192,64,0.5)',
            borderColor: '#F0C040',
            borderWidth: 2,
            borderRadius: 6,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { display: false } } }
        }
      });
    }

    if (champPickChartRef.current) {
      chartInstances.current.champPick = new Chart(champPickChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Azir', 'Orianna', 'Lee Sin', 'Jinx', 'Thresh', 'Aatrox', 'Ahri', 'Graves', 'Renekton', 'Kai\'Sa'],
          datasets: [{
            data: [45, 42, 38, 35, 32, 30, 28, 25, 23, 20],
            backgroundColor: ['#F0C040', '#0AC8B9', '#7B2FBE', '#E84057', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right', labels: { color: '#9CA3AF', font: { size: 10 }, padding: 8, usePointStyle: true } }
          },
          cutout: '60%',
        }
      });
    }

    if (radarChartRef.current) {
      chartInstances.current.radar = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Kills', 'Dano', 'Visão', 'CS', 'KP%', 'Sobrevivência'],
          datasets: [{
            label: 'Faker',
            data: [85, 92, 70, 95, 88, 80],
            backgroundColor: 'rgba(240,192,64,0.15)',
            borderColor: '#F0C040',
            borderWidth: 2,
            pointBackgroundColor: '#F0C040',
          }, {
            label: 'Média LCK Mid',
            data: [60, 65, 55, 70, 62, 58],
            backgroundColor: 'rgba(123,47,190,0.1)',
            borderColor: '#7B2FBE',
            borderWidth: 1,
            pointBackgroundColor: '#7B2FBE',
            borderDash: [5, 5],
          }]
        },
        options: {
          responsive: true,
          scales: { 
            r: { 
              beginAtZero: true, 
              max: 100, 
              grid: { color: 'rgba(255,255,255,0.08)' }, 
              angleLines: { color: 'rgba(255,255,255,0.08)' }, 
              pointLabels: { color: '#9CA3AF', font: { size: 11 } }, 
              ticks: { display: false } 
            } 
          },
          plugins: { legend: { labels: { color: '#9CA3AF', font: { size: 11 } } } }
        }
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3">
        <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
          Análises Comparativas
        </span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 card-hover">
          <h3 className="font-semibold text-white mb-4">Winrate Médio por Liga</h3>
          <canvas ref={leagueWRChartRef} height="260"></canvas>
        </div>
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 card-hover">
          <h3 className="font-semibold text-white mb-4">KDA dos Top 5 Jogadores Globais</h3>
          <canvas ref={topKDAChartRef} height="260"></canvas>
        </div>
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 card-hover">
          <h3 className="font-semibold text-white mb-4">Top Campeões mais Jogados (Pro Play)</h3>
          <canvas ref={champPickChartRef} height="260"></canvas>
        </div>
        <div className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 card-hover">
          <h3 className="font-semibold text-white mb-4">Radar — Faker (T1)</h3>
          <canvas ref={radarChartRef} height="260"></canvas>
        </div>
      </div>
    </section>
  );
}

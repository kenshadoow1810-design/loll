import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const LEAGUES = {
  ALL: { name: 'All Leagues' },
  CBLOL: { name: 'CBLOL' },
  LCK: { name: 'LCK' },
  LEC: { name: 'LEC' },
  LCS: { name: 'LCS' },
  LPL: { name: 'LPL' },
};

export function LeagueTabs({ currentLeague, onLeagueChange }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {Object.entries(LEAGUES).map(([key, { name }]) => (
        <button
          key={key}
          onClick={() => onLeagueChange(key)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            currentLeague === key
              ? 'border-gold-600/40 text-gold-400 tab-active'
              : 'border-gray-700/30 bg-dark-100 text-gray-400 hover:border-gold-600/40 hover:text-gold-400'
          }`}
        >
          {key === 'ALL' ? t('allLeagues') : name}
        </button>
      ))}
    </div>
  );
}

export function RankingsTable({ league }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {

        const data = league === 'ALL'
          ? await api.getRankingsAll()
          : await api.getRankings(league);

        setPlayers(data.slice(0, 10));

        const updateData = await api.getLastUpdateTime();
        setLastUpdate(updateData.formatted);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };
    loadRankings();
  }, [league]);

  if (loading) {
    return (
      <div className="bg-dark-100 border border-gray-700/30 rounded-2xl overflow-hidden p-8">
        <div className="animate-shimmer h-32 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-dark-100 border border-gray-700/30 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/30 flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-white">
          {league === 'ALL' ? t('globalRankings') : `${league} — Rankings 2026`}
        </h2>
        <span className="text-xs text-gray-500">{t('updated')}: {lastUpdate || t('minutesAgo')}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-700/20">
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">{t('player')}</th>
              <th className="px-6 py-3 text-left">{t('team')}</th>
              <th className="px-6 py-3 text-center">KDA</th>
              <th className="px-6 py-3 text-center">CS/M</th>
              <th className="px-6 py-3 text-center">KP%</th>
              <th className="px-6 py-3 text-center">WR%</th>
              <th className="px-6 py-3 text-center">{t('games')}</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const rank = index + 1;
              let rankBadge;
              if (rank === 1) rankBadge = <span className="text-gold-400 font-bold">1</span>;
              else if (rank === 2) rankBadge = <span className="text-gray-400 font-bold">2</span>;
              else if (rank === 3) rankBadge = <span className="text-amber-600 font-bold">3</span>;
              else rankBadge = <span className="text-gray-500 font-mono">{rank}</span>;

              const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';
              const kdaColor = player.kda >= 5 ? 'text-gold-400' : player.kda >= 3.5 ? 'text-accent-blue' : 'text-gray-400';

              return (
                <tr
                  key={player.id}
                  className="border-b border-gray-700/10 hover:bg-dark-200/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">{rankBadge}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.image_url || 'https://static.lolesports.com/players/1675150271520_placeholder.png'}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-white text-sm">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{player.team}</td>
                  <td className={`px-6 py-4 text-center font-display font-bold text-sm ${kdaColor}`}>{player.kda.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-300">{player.csPerMin.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-300">{player.kp}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-display font-bold text-sm ${wrColor}`}>{player.wr}%</span>
                    <div className="w-full bg-dark-300 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          player.wr >= 60 ? 'bg-green-500' : player.wr >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${player.wr}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">{player.games}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

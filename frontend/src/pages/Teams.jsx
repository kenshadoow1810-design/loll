import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TeamCard } from '../components/teams/TeamCard';
import { useLanguage } from '../context/LanguageContext';

export function Teams() {
  const [selectedLeague, setSelectedLeague] = useState('ALL');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const leagues = ['ALL', 'CBLOL', 'LCK', 'LEC', 'LCS', 'LPL'];

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      try {
        let data;
        if (selectedLeague === 'ALL') {
          data = await api.getTeams();
        } else {
          data = await api.getTeamsByLeague(selectedLeague);
        }
        setTeams(data);
      } catch (error) {
        console.error('Error loading teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedLeague]);

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            {t('allTeams')}
          </span>
        </h1>

        {/* Filtros de Liga */}
        <div className="mb-8 flex flex-wrap gap-2">
          {leagues.map(league => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedLeague === league
                  ? 'bg-gold-600 text-dark-300'
                  : 'bg-dark-100 text-gray-300 hover:text-gold-400 hover:bg-gold-600/10 border border-gray-700/30'
              }`}
            >
              {league === 'ALL' ? t('allLeagues') : league}
            </button>
          ))}
        </div>

        {/* Grid de Times */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-shimmer h-64 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map(team => (
                <TeamCard key={team.id} team={team} league={team.league} />
              ))}
            </div>

            {!teams.length && (
              <div className="text-center py-12 text-gray-500">
                {t('noTeamsFound')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

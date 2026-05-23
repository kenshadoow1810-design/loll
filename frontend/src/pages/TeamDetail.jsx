import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTeamData = async () => {
      setLoading(true);
      try {
        const teamData = await api.getTeamById(id);

        if (!teamData) {
          navigate('/teams');
          return;
        }

        setTeam(teamData);
      } catch (error) {
        console.error('Error loading team:', error);
        navigate('/teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-shimmer h-96 bg-gradient-to-r from-dark-100 via-dark-200 to-dark-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Header */}
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
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center text-6xl">
                    🎮
                  </div>
                )}
              </div>

              <div className="flex-1 pt-2">
                <div>
                  <h2 className="font-display font-bold text-3xl text-white">{team.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-gold-600/10 border border-gold-600/20 rounded-md text-xs text-gold-400 font-semibold">{team.league}</span>
                    <span className="px-2 py-1 bg-dark-200 rounded-md text-xs text-gray-400">{team.region}</span>
                  </div>
                </div>
                
                {/* Team Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-dark-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-white">{team.games}</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase">Partidas</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-green-400">{team.wins}</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase">Vitórias</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-red-400">{team.losses}</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase">Derrotas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="p-6">
            <h3 className="font-display font-bold text-xl text-white mb-4">Jogadores</h3>
            {team.players && team.players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                  <Link
                    key={player.id}
                    to={`/player/${player.id}/${player.league}`}
                    className="bg-dark-200 border border-gray-700/30 rounded-xl p-4 hover:border-gold-600/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400/10 to-gold-600/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white group-hover:text-gold-400 transition-colors truncate">{player.name}</h4>
                        <p className="text-xs text-gray-500">{player.role}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-gray-500">KDA</span>
                      <span className="text-white font-medium">{player.kda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">WR</span>
                      <span className={`font-medium ${player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {player.wr}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum jogador encontrado para este time
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

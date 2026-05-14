import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const [playerRes, statsRes, matchesRes, championsRes] = await Promise.all([
        fetch(`http://localhost:3001/api/players/${id}`),
        fetch(`http://localhost:3001/api/players/${id}/stats`),
        fetch(`http://localhost:3001/api/players/${id}/matches?limit=10`),
        fetch(`http://localhost:3001/api/players/${id}/champions?limit=5`)
      ]);

      if (playerRes.ok) setPlayer(await playerRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
      if (championsRes.ok) setChampions(await championsRes.json());
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Jogador não encontrado</h1>
        <Link to="/players/search" className="btn-primary">
          Buscar outro jogador
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Player Header */}
      <div className="card mb-6">
        <div className="flex items-center space-x-6">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profile_icon_id || 1}.png`}
            alt={player.name}
            className="w-24 h-24 rounded-full border-4 border-lol-gold"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gradient">{player.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {player.team_name && (
                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                  🏠 {player.team_name}
                </span>
              )}
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                🌍 {player.region}
              </span>
              {player.tier && (
                <span className="bg-lol-gold/20 text-lol-gold px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {player.tier} {player.rank}
                </span>
              )}
              {player.league_points && (
                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                  💎 {player.league_points} LP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Partidas</p>
            <p className="text-3xl font-bold">{stats.total_games || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Vitórias</p>
            <p className="text-3xl font-bold text-green-500">{stats.wins || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Derrotas</p>
            <p className="text-3xl font-bold text-red-500">{stats.losses || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Winrate</p>
            <p className="text-3xl font-bold text-lol-gold">{stats.winrate || 0}%</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">K/D/A Média</p>
            <p className="text-3xl font-bold">{stats.avg_kills || 0}/{stats.avg_deaths || 0}/{stats.avg_assists || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">KDA Ratio</p>
            <p className="text-3xl font-bold text-lol-gold">{stats.avg_kda || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">CS Médio</p>
            <p className="text-3xl font-bold">{stats.avg_cs || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Visão Média</p>
            <p className="text-3xl font-bold">{stats.avg_vision || 0}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'matches' 
              ? 'text-lol-gold border-b-2 border-lol-gold' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Últimas Partidas
        </button>
        <button
          onClick={() => setActiveTab('champions')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'champions' 
              ? 'text-lol-gold border-b-2 border-lol-gold' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Campeões
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">
              <p>Nenhuma partida registrada</p>
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className={`card border-l-4 ${
                  match.win ? 'border-l-green-500' : 'border-l-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.champion}.png`}
                      alt={match.champion}
                      className="w-16 h-16 rounded"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{match.champion}</h3>
                      <p className="text-sm text-gray-400">
                        {match.role} • {match.lane}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(match.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-xl ${
                      match.win ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {match.win ? 'VITÓRIA' : 'DERROTA'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {match.kills}/{match.deaths}/{match.assists}
                    </p>
                    <p className="text-xs text-gray-500">
                      KDA: {match.kda}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>CS: {match.cs}</p>
                    <p>Visão: {match.vision_score}</p>
                    <p>Duração: {Math.floor(match.game_duration / 60)}min</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'champions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {champions.length === 0 ? (
            <div className="card text-center text-gray-400 py-8 col-span-full">
              <p>Nenhum dado de campeões disponível</p>
            </div>
          ) : (
            champions.map((champ) => (
              <div key={champ.champion} className="card">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.champion}.png`}
                    alt={champ.champion}
                    className="w-16 h-16 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{champ.champion}</h3>
                    <p className="text-sm text-gray-400">
                      {champ.games_played} partidas
                    </p>
                    <p className="text-xs text-lol-gold">
                      {champ.winrate}% winrate
                    </p>
                    <p className="text-xs text-gray-500">
                      {champ.avg_kills}/{champ.avg_deaths}/{champ.avg_assists}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;

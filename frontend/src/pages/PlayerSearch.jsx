import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PlayerSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/players/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gradient">🔍 Buscar Jogador</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do jogador..."
            className="input-field flex-1 text-lg"
          />
          <button 
            type="submit" 
            className="btn-primary px-8"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {results.length === 0 && !loading && searchTerm && (
        <div className="card text-center text-gray-400 py-8">
          <p>Nenhum jogador encontrado para "{searchTerm}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            {results.length} resultado(s) encontrado(s)
          </h2>
          
          <div className="grid gap-4">
            {results.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player.id)}
                className="card hover:border-lol-gold transition-all cursor-pointer hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profile_icon_id || 1}.png`}
                    alt={player.name}
                    className="w-16 h-16 rounded-full border-2 border-lol-gold"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">{player.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {player.team_name && (
                        <span className="text-sm bg-gray-800 px-2 py-1 rounded">
                          🏠 {player.team_name}
                        </span>
                      )}
                      <span className="text-sm bg-gray-800 px-2 py-1 rounded">
                        🌍 {player.region}
                      </span>
                      {player.tier && (
                        <span className="text-sm text-lol-gold">
                          ⭐ {player.tier} {player.rank} - {player.league_points} LP
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>Vitórias: {player.wins || 0}</span>
                      <span>Derrotas: {player.losses || 0}</span>
                      <span>
                        Winrate:{' '}
                        {player.wins + player.losses > 0
                          ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-500">→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searchTerm && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">🎮 Digite o nome de um jogador para buscar</p>
          <p className="mt-2">Os dados são sincronizados da API da Riot Games</p>
        </div>
      )}
    </div>
  );
}

export default PlayerSearch;

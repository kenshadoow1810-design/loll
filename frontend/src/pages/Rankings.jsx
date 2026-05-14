import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Rankings() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('br1');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      loadRankings();
    }
  }, [selectedRegion]);

  const loadRegions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/leagues/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
        if (data.length > 0 && !selectedRegion) {
          setSelectedRegion(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/leagues/${selectedRegion}/rankings?tier=CHALLENGER`
      );
      if (response.ok) {
        const data = await response.json();
        setRankings(data || []);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentRegion = regions.find(r => r.id === selectedRegion);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gradient">🏆 Rankings por Liga</h1>

      {/* Region Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedRegion === region.id
                ? 'bg-lol-gold text-black font-semibold'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {region.name} ({region.label})
          </button>
        ))}
      </div>

      {/* Current Region Info */}
      {currentRegion && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {currentRegion.name} - {currentRegion.label}
          </h2>
          <p className="text-gray-400">Top 50 jogadores Challenger</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          Carregando rankings...
        </div>
      )}

      {/* Rankings Table */}
      {!loading && rankings.length === 0 && (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-xl">Nenhum jogador encontrado</p>
          <p className="text-sm mt-2">
            Use a sincronização para adicionar jogadores da região {currentRegion?.name}
          </p>
        </div>
      )}

      {!loading && rankings.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Jogador</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-center">Tier</th>
                  <th className="px-4 py-3 text-center">LP</th>
                  <th className="px-4 py-3 text-center">V/D</th>
                  <th className="px-4 py-3 text-center">Winrate</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-500' :
                        'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/players/${player.id}`}
                        className="flex items-center gap-3 hover:text-lol-gold transition-colors"
                      >
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profile_icon_id || 1}.png`}
                          alt={player.name}
                          className="w-10 h-10 rounded-full border-2 border-lol-gold"
                        />
                        <span className="font-semibold">{player.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {player.team_name ? (
                        <span className="text-sm bg-gray-800 px-2 py-1 rounded">
                          {player.team_name}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Sem time</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lol-gold font-semibold">
                        {player.tier} {player.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-lg">{player.league_points}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">
                      {player.wins}W / {player.losses}L
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${
                        player.winrate >= 60 ? 'text-green-500' :
                        player.winrate >= 50 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {player.winrate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rankings;

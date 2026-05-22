import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Champions = () => {
  const [champions, setChampions] = useState([]);
  const [filteredChampions, setFilteredChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedLeague, setSelectedLeague] = useState('GLOBAL');
  
  // Ordenação
  const [sortConfig, setSortConfig] = useState({ key: 'games_played', direction: 'desc' });

  const roles = ['ALL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const leagues = ['GLOBAL', 'LCS', 'LEC', 'LCK', 'LPL', 'CBLOL'];

  useEffect(() => {
    fetchChampions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [champions, searchTerm, selectedRole, selectedLeague, sortConfig]);

  const fetchChampions = async () => {
    try {
      setLoading(true);
      const data = await getChampionStats();
      setChampions(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados dos campeões. Certifique-se de que a pipeline foi executada.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...champions];

    // Filtro por nome
    if (searchTerm) {
      result = result.filter(champ =>
        champ.champion_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (selectedRole !== 'ALL') {
      result = result.filter(champ => champ.role === selectedRole);
    }

    // Filtro por liga
    if (selectedLeague !== 'GLOBAL') {
      result = result.filter(champ => champ.league === selectedLeague);
    }

    // Ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Calcular métricas derivadas se necessário
        if (sortConfig.key === 'win_percentage') {
          aValue = a.win_percentage || 0;
          bValue = b.win_percentage || 0;
        } else if (sortConfig.key === 'ban_percentage') {
          aValue = a.ban_percentage || 0;
          bValue = b.ban_percentage || 0;
        } else if (sortConfig.key === 'kda') {
          aValue = (a.total_kills + a.total_assists) / Math.max(a.total_deaths, 1);
          bValue = (b.total_kills + b.total_assists) / Math.max(b.total_deaths, 1);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredChampions(result);
  };
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '2195';
    return sortConfig.direction === 'asc' ? '2191' : '2193';
  };

  const calculateKDA = (kills, deaths, assists) => {
    if (deaths === 0) return kills + assists;
    return ((kills + assists) / deaths).toFixed(2);
  };


  const getChampionIcon = (championName, iconUrl) => {
    // Priorizar icon_url do backend
    if (iconUrl && iconUrl.trim() !== '') {
      return iconUrl;
    }
    // Fallback para ddragon se não tiver icon_url
    if (!championName) return null;
    const formattedName = championName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  if (loading) return <div className="loading">Carregando campeões...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pt-24 pb-12 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-3xl text-white mb-8">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Estatísticas Detalhadas de Campeões
          </span>
        </h1>

        <div className="mb-8 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar campeão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'ALL' ? 'Todas as Roles' : role}
              </option>
            ))}
          </select>

          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
          >
            {leagues.map(league => (
              <option key={league} value={league}>
                {league === 'GLOBAL' ? 'Global (Todas)' : league}
              </option>
            ))}
          </select>
        </div>

        <div className="champions-table-container">
          <table className="champions-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('champion_name')}>
                  Campeão {getSortIcon('champion_name')}
                </th>
                <th onClick={() => handleSort('role')}>
                  Role {getSortIcon('role')}
                </th>
                <th onClick={() => handleSort('league')}>
                  Liga {getSortIcon('league')}
                </th>
                <th onClick={() => handleSort('games_played')}>
                  Games {getSortIcon('games_played')}
                </th>
                <th onClick={() => handleSort('win_percentage')}>
                  Win Rate % {getSortIcon('win_percentage')}
                </th>
                <th onClick={() => handleSort('ban_percentage')}>
                  Ban Rate % {getSortIcon('ban_percentage')}
                </th>
                <th onClick={() => handleSort('total_kills')}>
                  Kills {getSortIcon('total_kills')}
                </th>
                <th onClick={() => handleSort('total_deaths')}>
                  Deaths {getSortIcon('total_deaths')}
                </th>
                <th onClick={() => handleSort('total_assists')}>
                  Assists {getSortIcon('total_assists')}
                </th>
                <th onClick={() => handleSort('kda')}>
                  KDA {getSortIcon('kda')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredChampions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    Nenhum campeão encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredChampions.map((champ, index) => (
                  <tr key={`${champ.champion_name}-${champ.role}-${index}`}>
                    <td className="champion-name">
                      <div className="champion-cell">
                        <img 
                          src={getChampionIcon(champ.champion_name, champ.icon_url)} 
                          alt={champ.champion_name}
                          className="champion-icon"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aatrox.png';
                          }}
                        />
                        <span>{champ.champion_name}</span>
                      </div>
                    </td>
                    <td><span className="role-badge">{champ.role}</span></td>
                    <td>{champ.league || 'GLOBAL'}</td>
                    <td>{champ.games_played}</td>
                    <td className="win-rate">{champ.win_percentage?.toFixed(1) || '0.0'}%</td>
                    <td className="ban-rate">{champ.ban_percentage?.toFixed(1) || '0.0'}%</td>
                    <td>{champ.total_kills}</td>
                    <td>{champ.total_deaths}</td>
                    <td>{champ.total_assists}</td>
                    <td className="kda">{calculateKDA(champ.total_kills, champ.total_deaths, champ.total_assists)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="results-info">
          Exibindo {filteredChampions.length} de {champions.length} campeões
        </div>
      </div>
    </div>
  );
};

export default Champions;

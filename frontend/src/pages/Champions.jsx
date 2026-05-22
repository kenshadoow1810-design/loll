import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Champions.css';

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

    // Filtro por liga (assumindo que os dados têm campo league, se não, ignorar)
    if (selectedLeague !== 'GLOBAL') {
      result = result.filter(champ => champ.league === selectedLeague);
    }

    // Ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Calcular métricas derivadas se necessário
        if (sortConfig.key === 'win_rate') {
          aValue = (a.wins / a.games_played) * 100;
          bValue = (b.wins / b.games_played) * 100;
        } else if (sortConfig.key === 'kda') {
          aValue = (a.total_kills + a.total_assists) / Math.max(a.total_deaths, 1);
          bValue = (b.total_kills + b.total_assists) / Math.max(b.total_deaths, 1);
        } else if (sortConfig.key === 'ban_rate') {
          const totalGamesA = a.games_played + a.bans;
          const totalGamesB = b.games_played + b.bans;
          aValue = (a.bans / totalGamesA) * 100;
          bValue = (b.bans / totalGamesB) * 100;
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
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const calculateKDA = (kills, deaths, assists) => {
    if (deaths === 0) return kills + assists;
    return ((kills + assists) / deaths).toFixed(2);
  };

  const calculateWinRate = (wins, games) => {
    return ((wins / games) * 100).toFixed(1);
  };

  const calculateBanRate = (bans, games) => {
    const total = games + bans;
    return ((bans / total) * 100).toFixed(1);
  };

  const getChampionIcon = (championName, iconUrl) => {
    if (iconUrl) return iconUrl;
    if (!championName) return null;
    // Formatar nome do campeão para URL (remove espaços, acentos, etc.)
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
    <div className="champions-page">
      <div className="page-header">
        <h1>Estatísticas Detalhadas de Campeões</h1>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Buscar Campeão:</label>
          <input
            type="text"
            placeholder="Nome do campeão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'ALL' ? 'Todas as Roles' : role}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Liga:</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="filter-select"
          >
            {leagues.map(league => (
              <option key={league} value={league}>
                {league === 'GLOBAL' ? 'Global (Todas)' : league}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="champions-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('champion_name')}>
                Campeão {getSortIcon('champion_name')}
              </th>
              <th onClick={() => handleSort('role')}>
                Role {getSortIcon('role')}
              </th>
              <th onClick={() => handleSort('games_played')}>
                Games {getSortIcon('games_played')}
              </th>
              <th onClick={() => handleSort('wins')}>
                Wins {getSortIcon('wins')}
              </th>
              <th onClick={() => handleSort('win_rate')}>
                Win Rate % {getSortIcon('win_rate')}
              </th>
              <th onClick={() => handleSort('bans')}>
                Bans {getSortIcon('bans')}
              </th>
              <th onClick={() => handleSort('ban_rate')}>
                Ban Rate % {getSortIcon('ban_rate')}
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
                <td colSpan="11" className="no-data">
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
                  <td className="role-badge">{champ.role}</td>
                  <td>{champ.games_played}</td>
                  <td>{champ.wins}</td>
                  <td className="win-rate">{calculateWinRate(champ.wins, champ.games_played)}%</td>
                  <td>{champ.bans}</td>
                  <td className="ban-rate">{calculateBanRate(champ.bans, champ.games_played)}%</td>
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
  );
};

export default Champions;

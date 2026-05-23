import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navbar
    rankings: 'Rankings',
    players: 'Players',
    teams: 'Teams',
    champions: 'Champions',
    compare: 'Compare',
    searchPlayer: 'Search player...',
    noPlayerFound: 'No player found',
    
    // Home
    statistics: 'Statistics',
    proPlayers: 'of Pro Players',
    followBestPlayers: 'Follow the best players in the world in real time. Rankings, KDA, winrate and more.',
    players: 'Players',
    leagues: 'Leagues',
    update: 'Update',
    allLeagues: 'All Leagues',
    updated: 'Updated',
    minutesAgo: 'a few minutes ago',
    
    // Rankings Table
    player: 'Player',
    team: 'Team',
    games: 'Games',
    
    // Players Page
    allPlayers: 'All Players',
    searchByNameTeamOrLeague: 'Search by name, team or league...',
    noPlayersFound: 'No players found for',
    
    // Team Pages
    allTeams: 'All Teams',
    noTeamsFound: 'No teams found for this league',
    wins: 'Wins',
    losses: 'Losses',
    players: 'Players',
    noPlayersForTeam: 'No players found for this team',
    
    // Player Detail
    mainStats: 'Main Stats',
    winRate: 'Win Rate',
    csPerMin: 'CS/Min',
    killParticipation: 'Kill Participation',
    gamesPlayed: 'Games Played',
    performanceRadar: 'Performance Radar',
    championsDataSoon: 'Champion data will be available soon.',
    functionalityNote: 'This feature will be implemented when the scraping pipeline is updated with champion stats links.',
    
    // Compare Page
    comparePlayers: 'Compare Players',
    player1: 'Player 1',
    player2: 'Player 2',
    select: 'Select...',
    statsComparison: 'Stats Comparison',
    selectTwoPlayers: 'Select two players to compare their statistics',
    
    // Champions Page
    championStats: 'Detailed Champion Statistics',
    searchChampion: 'Search champion...',
    allRoles: 'All Roles',
    global: 'Global (All)',
    loadingChampions: 'Loading champions...',
    errorLoadingChampions: 'Error loading champion data. Make sure the pipeline has been executed.',
    noChampionsFound: 'No champions found with the selected filters.',
    displaying: 'Displaying',
    of: 'of',
    champions: 'champions',
    
    // Schedule
    upcomingMatches: 'Upcoming Matches',
    weeklySchedule: 'Weekly Schedule',
    loadingMatches: 'Loading matches...',
    noMatchesScheduled: 'No matches scheduled for the next 7 days.',
    watch: 'Watch',
    
    // Footer
    unofficialData: 'Unofficial data. Riot Games does not endorse this site.',
    allRightsReserved: 'All rights reserved.',
    
    // Common
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    role: 'Role',
    region: 'Region',
    league: 'League',
  },
  pt: {
    // Navbar
    rankings: 'Rankings',
    players: 'Jogadores',
    teams: 'Times',
    champions: 'Campeões',
    compare: 'Comparar',
    searchPlayer: 'Buscar jogador...',
    noPlayerFound: 'Nenhum jogador encontrado',
    
    // Home
    statistics: 'Estatísticas',
    proPlayers: 'de Pro Players',
    followBestPlayers: 'Acompanhe os melhores jogadores do mundo em tempo real. Rankings, KDA, winrate e muito mais.',
    players: 'Jogadores',
    leagues: 'Ligas',
    update: 'Atualização',
    allLeagues: 'Todas as Ligas',
    updated: 'Atualizado',
    minutesAgo: 'há alguns minutos',
    
    // Rankings Table
    player: 'Jogador',
    team: 'Time',
    games: 'Partidas',
    
    // Players Page
    allPlayers: 'Todos os Jogadores',
    searchByNameTeamOrLeague: 'Buscar por nome, time ou liga...',
    noPlayersFound: 'Nenhum jogador encontrado para',
    
    // Team Pages
    allTeams: 'Times',
    noTeamsFound: 'Nenhum time encontrado para esta liga',
    wins: 'Vitórias',
    losses: 'Derrotas',
    players: 'Jogadores',
    noPlayersForTeam: 'Nenhum jogador encontrado para este time',
    
    // Player Detail
    mainStats: 'Estatísticas Principais',
    winRate: 'Win Rate',
    csPerMin: 'CS/Média',
    killParticipation: 'Kill Participation',
    gamesPlayed: 'Partidas Jogadas',
    performanceRadar: 'Radar de Performance',
    championsDataSoon: 'Dados de campeões serão disponíveis em breve.',
    functionalityNote: 'Esta funcionalidade será implementada quando a pipeline de scraping for atualizada com os links das estatísticas de campeões.',
    
    // Compare Page
    comparePlayers: 'Comparar Jogadores',
    player1: 'Jogador 1',
    player2: 'Jogador 2',
    select: 'Selecione...',
    statsComparison: 'Comparação de Estatísticas',
    selectTwoPlayers: 'Selecione dois jogadores para comparar suas estatísticas',
    
    // Champions Page
    championStats: 'Estatísticas Detalhadas de Campeões',
    searchChampion: 'Buscar campeão...',
    allRoles: 'Todas as Roles',
    global: 'Global (Todas)',
    loadingChampions: 'Carregando campeões...',
    errorLoadingChampions: 'Erro ao carregar dados dos campeões. Certifique-se de que a pipeline foi executada.',
    noChampionsFound: 'Nenhum campeão encontrado com os filtros selecionados.',
    displaying: 'Exibindo',
    of: 'de',
    champions: 'campeões',
    
    // Schedule
    upcomingMatches: 'Próximas Partidas',
    weeklySchedule: 'Cronograma da Semana',
    loadingMatches: 'Carregando partidas...',
    noMatchesScheduled: 'Nenhuma partida agendada para os próximos 7 dias.',
    watch: 'Assistir',
    
    // Footer
    unofficialData: 'Dados não oficiais. Riot Games não endossa este site.',
    allRightsReserved: 'Todos os direitos reservados.',
    
    // Common
    close: 'Fechar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    remove: 'Remover',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    role: 'Função',
    region: 'Região',
    league: 'Liga',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pt' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

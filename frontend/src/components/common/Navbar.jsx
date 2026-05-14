import { Link, useLocation } from 'react-router-dom';
import { Search, Trophy, Twitter, Github, Disc } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';

export function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { path: '/', label: 'Rankings' },
    { path: '/players', label: 'Jogadores' },
    { path: '/matches', label: 'Partidas' },
    { path: '/news', label: 'Notícias' },
  ];

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowDropdown(false);
      return;
    }

    try {
      const allPlayers = await api.getAllPlayers();
      const results = allPlayers
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const executeSearch = async () => {
    if (searchQuery.length < 2) return;
    
    try {
      const allPlayers = await api.getAllPlayers();
      const found = allPlayers.find(p => p.name.toLowerCase() === searchQuery.toLowerCase());
      if (found) {
        window.location.href = `/player/${found.id}/${found.league}`;
        setSearchQuery('');
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200/90 backdrop-blur-xl border-b border-gold-600/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-dark-300" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider">
              <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Pro</span>
              <span className="text-gray-300">Stats</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'text-gold-400 bg-gold-600/10'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-gold-600/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            
            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-dark-100 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">Nenhum jogador encontrado</div>
                ) : (
                  searchResults.map(player => (
                    <Link
                      key={player.id}
                      to={`/player/${player.id}/${player.league}`}
                      className="flex items-center gap-3 p-3 hover:bg-dark-200 cursor-pointer transition-colors border-b border-gray-700/10 last:border-0"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-600/30 flex items-center justify-center text-sm">
                        {player.teamLogo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.team} • {player.league} • {player.role}</div>
                      </div>
                      <div className="text-xs font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-700/30 bg-dark-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-dark-300" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider">
              <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Pro</span>
              <span className="text-gray-400">Stats</span>
            </span>
          </div>
          <div className="text-center text-xs text-gray-600">
            Dados não oficiais. Riot Games não endossa este site.<br />
            © 2026 ProStats LoL. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <Disc className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

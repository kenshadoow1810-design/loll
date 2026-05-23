import { Link, useLocation } from 'react-router-dom';
import { Search, Trophy, Globe } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { t, toggleLanguage, language } = useLanguage();
  
  const navLinks = [
    { path: '/', label: t('rankings') },
    { path: '/players', label: t('players') },
    { path: '/teams', label: t('teams') },
    { path: '/champions', label: t('champions') },
    { path: '/compare', label: t('compare') },
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

    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200/90 backdrop-blur-xl border-b border-gold-600/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-dark-300" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider">
              <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Pro</span>
              <span className="text-gray-300">Stats</span>
            </span>
          </Link>

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

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-100 border border-gray-700/50 text-gray-300 hover:text-gold-400 hover:border-gold-600/40 transition-all"
              title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold">{language === 'en' ? 'PT' : 'EN'}</span>
            </button>
          
            <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlayer')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-dark-100 border border-gray-700/50 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-dark-100 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">{t('noPlayerFound')}</div>
                ) : (
                  searchResults.map(player => (
                    <Link
                      key={player.id}
                      to={`/player/${player.id}/${player.league}`}
                      className="flex items-center gap-3 p-3 hover:bg-dark-200 cursor-pointer transition-colors border-b border-gray-700/10 last:border-0"
                      onClick={() => setShowDropdown(false)}
                    >
                      {player.image_url ? (
                        <img 
                          src={player.image_url} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-gold-600/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-600/30 flex items-center justify-center text-sm">
                          {player.teamLogo}
                        </div>
                      )}
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
      </div>
    </nav>
  );
}

export function Footer() {
  const { t } = useLanguage();
  
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
            {t('unofficialData')}<br />
            © 2026 ProStats LoL. {t('allRightsReserved')}
          </div>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="p-2 rounded-lg bg-dark-100 text-gray-500 hover:text-gold-400 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gradient">
            🏆 LoL Pro Stats
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-lol-gold transition-colors">
              Início
            </Link>
            <Link to="/rankings" className="hover:text-lol-gold transition-colors">
              Rankings
            </Link>
            <Link to="/players/search" className="hover:text-lol-gold transition-colors">
              Jogadores
            </Link>
            <Link to="/news" className="hover:text-lol-gold transition-colors">
              Notícias
            </Link>
          </nav>
          
          <Link to="/players/search" className="btn-primary">
            Buscar Player
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

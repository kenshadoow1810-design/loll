import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [playersRes, newsRes] = await Promise.all([
        api.get('/players/top?limit=10'),
        api.get('/news?limit=5')
      ]);
      
      setTopPlayers(playersRes.data || []);
      setNews(newsRes.data || []);
    } catch (error) {
      console.error('Error loading home data:', error);
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-b from-gray-900 to-transparent rounded-lg">
        <h1 className="text-5xl font-bold mb-4 text-gradient">
          LoL Pro Stats
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Estatísticas de jogadores profissionais de League of Legends
        </p>
        <Link to="/players/search" className="btn-primary text-lg px-8 py-3">
          Buscar Jogador
        </Link>
      </section>

      {/* Top Players */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🏆 Top Jogadores</h2>
          <Link to="/rankings" className="text-lol-gold hover:underline">
            Ver todos →
          </Link>
        </div>
        
        {topPlayers.length === 0 ? (
          <div className="card text-center text-gray-400 py-8">
            <p>Nenhum jogador cadastrado ainda.</p>
            <p className="text-sm mt-2">Use a sincronização para adicionar jogadores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPlayers.map((player) => (
              <Link 
                key={player.id} 
                to={`/players/${player.id}`}
                className="card hover:border-lol-gold transition-all hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profile_icon_id || 1}.png`}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border-2 border-lol-gold"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-sm text-gray-400">
                      {player.team_name || 'Sem time'} • {player.region}
                    </p>
                    <p className="text-xs text-lol-gold">
                      {player.tier} {player.rank} - {player.league_points} LP
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* News */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📰 Últimas Notícias</h2>
          <Link to="/news" className="text-lol-gold hover:underline">
            Ver todas →
          </Link>
        </div>
        
        {news.length === 0 ? (
          <div className="card text-center text-gray-400 py-8">
            <p>Nenhuma notícia disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => (
              <a 
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card hover:border-lol-gold transition-all"
              >
                <div className="flex space-x-4">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.summary || 'Clique para ler mais...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {item.source} • {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

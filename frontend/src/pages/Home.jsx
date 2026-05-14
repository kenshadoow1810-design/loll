import { useState } from 'react';
import { LeagueTabs, RankingsTable } from '../components/home/RankingsSection';
import { PlayersGrid } from '../components/players/PlayerCard';
import { MatchesFeed } from '../components/matches/MatchCard';
import { NewsGrid } from '../components/news/NewsCard';
import { ChartsSection } from '../components/charts/ChartsSection';
import { api } from '../services/api';
import { useEffect } from 'react';

export function Home() {
  const [currentLeague, setCurrentLeague] = useState('CBLOL');
  const [topPlayers, setTopPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [top, newsData, matches] = await Promise.all([
        api.getTopPlayers(8),
        api.getNews(),
        api.getRecentMatches(),
      ]);
      setTopPlayers(top);
      setNews(newsData);
      setRecentMatches(matches.slice(0, 10));
    };
    loadData();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-hero py-16 lg:py-24" style={{ 
        background: 'radial-gradient(ellipse at 50% 0%, rgba(240,192,64,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(10,200,185,0.05) 0%, transparent 50%), #0A0B0E'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
            <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Estatísticas</span><br />
            <span className="text-gray-100">de Pro Players</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Acompanhe os melhores jogadores do mundo em tempo real. Rankings, KDA, winrate e muito mais.
          </p>
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-gold-400">1,247</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Jogadores</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-blue">84,320</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Partidas</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-purple">5</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Ligas</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-red">24/7</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Atualização</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LeagueTabs currentLeague={currentLeague} onLeagueChange={setCurrentLeague} />
        <RankingsTable league={currentLeague} />
      </section>

      {/* Top Players */}
      <PlayersGrid players={topPlayers} title="Destaques" />

      {/* Charts */}
      <ChartsSection />

      {/* News */}
      <NewsGrid news={news} />

      {/* Recent Matches */}
      <MatchesFeed matches={recentMatches} />
    </div>
  );
}

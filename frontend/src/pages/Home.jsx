import { useState } from 'react';
import { LeagueTabs, RankingsTable } from '../components/home/RankingsSection';
import { TopChampionsChart, TopKDAChart } from '../components/home/StatsCharts';

export function Home() {
  const [currentLeague, setCurrentLeague] = useState('CBLOL');
  
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
              <div className="font-display font-bold text-3xl text-accent-blue">5</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Ligas</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-purple">24/7</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Atualização</div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display font-bold text-2xl text-white mb-6">
          <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Estatísticas Globais
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <TopChampionsChart />
          <TopKDAChart />
        </div>
      </section>

      {/* Rankings Section - Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LeagueTabs currentLeague={currentLeague} onLeagueChange={setCurrentLeague} />
        <RankingsTable league={currentLeague} />
      </section>
    </div>
  );
}

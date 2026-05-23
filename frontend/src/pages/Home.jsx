import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeagueTabs, RankingsTable } from '../components/home/RankingsSection';
import { ScheduleCarousel } from '../components/schedule/ScheduleCarousel';
import { useLanguage } from '../../context/LanguageContext';

export function Home() {
  const [currentLeague, setCurrentLeague] = useState('ALL');
  const [totalPlayers, setTotalPlayers] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Buscar total de jogadores
    const fetchTotalPlayers = async () => {
      try {
        const data = await api.getTotalPlayersCount();
        setTotalPlayers(data.total);
      } catch (error) {
        console.error('Erro ao buscar total de jogadores:', error);
      }
    };

    // Buscar última atualização
    const fetchLastUpdate = async () => {
      try {
        const data = await api.getLastUpdateTime();
        setLastUpdate(data.formatted);
      } catch (error) {
        console.error('Erro ao buscar última atualização:', error);
      }
    };

    fetchTotalPlayers();
    fetchLastUpdate();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-hero py-16 lg:py-24" style={{ 
        background: 'radial-gradient(ellipse at 50% 0%, rgba(240,192,64,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(10,200,185,0.05) 0%, transparent 50%), #0A0B0E'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
            <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">{t('statistics')}</span><br />
            <span className="text-gray-100">{t('proPlayers')}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            {t('followBestPlayers')}
          </p>
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-gold-400">
                {totalPlayers !== null ? totalPlayers.toLocaleString('pt-BR') : '...'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{t('players')}</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-blue">5</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{t('leagues')}</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-accent-purple">
                {lastUpdate || '...'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{t('update')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Section - Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LeagueTabs currentLeague={currentLeague} onLeagueChange={setCurrentLeague} />
        <RankingsTable league={currentLeague} />
      </section>

      {/* Schedule Carousel Section */}
      <ScheduleCarousel />
    </div>
  );
}

import { useState, useEffect } from 'react';
import './ScheduleCarousel.css';

export function ScheduleCarousel() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % matches.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [matches.length, isPaused]);

  const fetchMatches = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/schedule`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcomingMatches = data
        .filter(match => {
          const matchDate = new Date(match.scheduled_at || match.begin_at);
          return match.status === 'not_started' && 
                 matchDate >= today && 
                 matchDate <= nextWeek;
        })
        .sort((a, b) => {
          const dateA = new Date(a.scheduled_at || a.begin_at);
          const dateB = new Date(b.scheduled_at || b.begin_at);
          return dateA - dateB;
        });

      setMatches(upcomingMatches.slice(0, 10));
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${day}/${month} - ${hours}:${minutes}`;
  };

  const getTeamImage = (opponent) => {
    if (!opponent || opponent.type !== 'Team' || !opponent.opponent) return null;
    const team = opponent.opponent;
    return team.dark_mode_image_url || team.image_url;
  };

  const getTeamName = (opponent) => {
    if (!opponent || opponent.type !== 'Team' || !opponent.opponent) return 'TBD';
    return opponent.opponent.acronym || opponent.opponent.name;
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  if (loading) {
    return (
      <section className="schedule-section">
        <div className="schedule-container">
          <h2 className="schedule-title">
            <span className="text-gradient">Próximas Partidas</span>
          </h2>
          <div className="schedule-loading">Carregando partidas...</div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="schedule-section">
        <div className="schedule-container">
          <h2 className="schedule-title">
            <span className="text-gradient">Próximas Partidas</span>
          </h2>
          <div className="schedule-loading">Nenhuma partida agendada para os próximos 7 dias.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="schedule-section">
      <div className="schedule-container">
        <h2 className="schedule-title">
          <span className="text-gradient">Cronograma da Semana</span>
        </h2>
        
        <div 
          className="schedule-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button className="carousel-btn prev-btn" onClick={prevSlide}>
            ‹
          </button>

          <div className="carousel-track">
            {matches.map((match, index) => {
              const opponents = match.opponents || [];
              const team1 = opponents[0];
              const team2 = opponents[1];
              const league = match.league;
              const tournament = match.tournament;
              const hasStream = match.streams_list && match.streams_list.length > 0;
              const streamUrl = hasStream ? match.streams_list.find(s => s.main)?.raw_url : null;

              return (
                <div 
                  key={match.id} 
                  className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
                >
                  <div className="match-card">
                    <div className="match-header">
                      <div className="league-info">
                        {league?.image_url && (
                          <img 
                            src={league.image_url.trim()} 
                            alt={league.name}
                            className="league-logo"
                          />
                        )}
                        <div className="league-text">
                          <span className="league-name">{league?.name || 'Liga'}</span>
                          <span className="tournament-name">{tournament?.name || ''}</span>
                        </div>
                      </div>
                      <div className="match-format">
                        BO{match.number_of_games || 1}
                      </div>
                    </div>

                    <div className="match-body">
                      <div className="team team-left">
                        <img 
                          src={getTeamImage(team1)} 
                          alt={getTeamName(team1)}
                          className="team-logo"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60?text=?';
                          }}
                        />
                        <span className="team-name">{getTeamName(team1)}</span>
                      </div>

                      <div className="vs-divider">
                        <span className="vs-text">VS</span>
                      </div>

                      <div className="team team-right">
                        <img 
                          src={getTeamImage(team2)} 
                          alt={getTeamName(team2)}
                          className="team-logo"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60?text=?';
                          }}
                        />
                        <span className="team-name">{getTeamName(team2)}</span>
                      </div>
                    </div>

                    <div className="match-footer">
                      <div className="match-date">
                        <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{formatDate(match.scheduled_at || match.begin_at)}</span>
                      </div>
                      
                      {streamUrl && (
                        <a 
                          href={streamUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="watch-btn"
                        >
                          <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Assistir
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="carousel-btn next-btn" onClick={nextSlide}>
            ›
          </button>
        </div>

        <div className="carousel-dots">
          {matches.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

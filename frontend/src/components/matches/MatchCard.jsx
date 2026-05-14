import { Link } from 'react-router-dom';

export function MatchCard({ match }) {
  const kdaStr = `${match.kills}/${match.deaths}/${match.assists}`;
  const kdaVal = ((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2);
  const timeStr = match.timeAgo < 60 ? `${match.timeAgo}min atrás` : `${Math.floor(match.timeAgo / 60)}h atrás`;

  return (
    <Link
      to={`/player/${match.playerId}/${match.league}`}
      className={`bg-dark-100 border ${match.win ? 'border-green-500/20' : 'border-red-500/20'} rounded-xl p-4 flex items-center justify-between card-hover block`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${match.win ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
          {match.win ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div>
          <div className="font-semibold text-white text-sm">
            {match.player} <span className="text-gray-500 font-normal">— {match.champion}</span>
          </div>
          <div className="text-xs text-gray-500">{match.league} • {match.duration}min • {timeStr}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-gray-300">{kdaStr}</div>
        <div className="text-xs text-gray-500">KDA: {kdaVal}</div>
      </div>
      <div className="hidden sm:block text-right ml-4">
        <div className="text-xs text-gray-400">{match.cs.toLocaleString()} CS</div>
        <div className="text-xs text-gray-500">{(match.damage / 1000).toFixed(1)}k dmg</div>
      </div>
    </Link>
  );
}

export function MatchesFeed({ matches, title, limit }) {
  const displayMatches = limit ? matches.slice(0, limit) : matches;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3">
        <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
          {title || 'Feed de Partidas Recentes'}
        </span>
      </h2>
      <div className="space-y-3">
        {displayMatches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

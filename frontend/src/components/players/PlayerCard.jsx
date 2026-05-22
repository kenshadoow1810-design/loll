import { Link } from 'react-router-dom';

export function PlayerCard({ player }) {
  const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Link
      to={`/player/${player.id}/${player.league}`}
      className="bg-dark-100 border border-gray-700/30 rounded-2xl p-6 card-hover cursor-pointer block"
    >
      <div className="flex items-center gap-4 mb-5">
        <img 
          src={player.image_url || 'https://static.lolesports.com/players/1675150271520_placeholder.png'} 
          alt={player.name}
          className="w-24 h-24 rounded-xl object-cover"
        />
        <div>
          <div className="font-bold text-white text-xl">{player.name}</div>
          <div className="text-sm text-gray-400 font-medium">{player.team} • {player.league}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">KDA</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-display font-bold ${wrColor}`}>{player.wr}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">WR</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-accent-blue">{player.kp}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">KP</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400 font-medium">
        <span className="uppercase tracking-wide">{player.role}</span>
        <span>{player.games} partidas</span>
      </div>
    </Link>
  );
}

export function PlayersGrid({ players, title }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3">
        <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
          {title || 'Destaques'}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
}

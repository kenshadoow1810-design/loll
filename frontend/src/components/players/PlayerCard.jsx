import { Link } from 'react-router-dom';

export function PlayerCard({ player }) {
  const wrColor = player.wr >= 60 ? 'text-green-400' : player.wr >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Link
      to={`/player/${player.id}/${player.league}`}
      className="bg-dark-100 border border-gray-700/30 rounded-2xl p-5 card-hover cursor-pointer block"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-600/30 flex items-center justify-center text-xl">
          {player.teamLogo}
        </div>
        <div>
          <div className="font-bold text-white">{player.name}</div>
          <div className="text-xs text-gray-500">{player.team} • {player.league}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-display font-bold text-gold-400">{player.kda.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500 uppercase">KDA</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-display font-bold ${wrColor}`}>{player.wr}%</div>
          <div className="text-[10px] text-gray-500 uppercase">WR</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-display font-bold text-accent-blue">{player.kp}%</div>
          <div className="text-[10px] text-gray-500 uppercase">KP</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{player.role}</span>
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

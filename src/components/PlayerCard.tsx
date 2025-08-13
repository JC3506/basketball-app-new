import { Player, PlayerStats } from '@/lib/store'

interface PlayerCardProps {
  player: Player;
  stats: PlayerStats;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: () => void;
}

export default function PlayerCard({ 
  player, 
  stats, 
  isSelected, 
  onSelect, 
  onToggleActive 
}: PlayerCardProps) {
  return (
    <div 
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-sm">
          #{player.number}
        </span>
        <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">
          {player.position}
        </span>
      </div>
      
      <p className="font-bold mt-1 truncate">{player.name}</p>
      
      <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
        <div className="text-center">
          <p className="font-bold">{stats.PTS}</p>
          <p>PTS</p>
        </div>
        <div className="text-center">
          <p className="font-bold">{stats['REB_OFF'] + stats['REB_DEF']}</p>
          <p>REB</p>
        </div>
        <div className="text-center">
          <p className="font-bold">{stats.AST}</p>
          <p>AST</p>
        </div>
      </div>
      
      <button 
        className={`w-full mt-2 ${
          player.isActive
            ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200'
            : 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200'
        } font-bold py-1 px-2 rounded text-xs`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleActive()
        }}
      >
        {player.isActive ? 'Bench' : 'Activate'}
      </button>
    </div>
  )
}
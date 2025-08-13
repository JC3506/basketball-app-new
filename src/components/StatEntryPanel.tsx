import { Player, PlayerStats } from '@/lib/store'

interface StatEntryPanelProps {
  player: Player;
  stats: PlayerStats;
  onRecordStat: (statType: keyof PlayerStats) => void;
}

export default function StatEntryPanel({ 
  player, 
  stats, 
  onRecordStat 
}: StatEntryPanelProps) {
  // Calculate shooting percentages
  const calculatePercentage = (made: number, total: number): string => {
    if (total === 0) return '0.0%'
    return ((made / total) * 100).toFixed(1) + '%'
  }
  
  const fg2Percentage = calculatePercentage(
    stats['2PT_MADE'], 
    stats['2PT_MADE'] + stats['2PT_MISS']
  )
  
  const fg3Percentage = calculatePercentage(
    stats['3PT_MADE'], 
    stats['3PT_MADE'] + stats['3PT_MISS']
  )
  
  const ftPercentage = calculatePercentage(
    stats['FT_MADE'], 
    stats['FT_MADE'] + stats['FT_MISS']
  )
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold mb-4">
        Record Stats: {player.name} <span className="text-gray-500">#{player.number}</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Shooting */}
        <div className="p-3 border rounded-lg">
          <h3 className="font-bold mb-2">Shooting</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('2PT_MADE')}
            >
              2PT Made
            </button>
            <button 
              className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('2PT_MISS')}
            >
              2PT Miss
            </button>
            <button 
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('3PT_MADE')}
            >
              3PT Made
            </button>
            <button 
              className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('3PT_MISS')}
            >
              3PT Miss
            </button>
            <button 
              className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('FT_MADE')}
            >
              FT Made
            </button>
            <button 
              className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('FT_MISS')}
            >
              FT Miss
            </button>
          </div>
        </div>
        
        {/* Rebounds */}
        <div className="p-3 border rounded-lg">
          <h3 className="font-bold mb-2">Rebounds</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('REB_OFF')}
            >
              Offensive
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('REB_DEF')}
            >
              Defensive
            </button>
          </div>
        </div>
        
        {/* Assists & Steals */}
        <div className="p-3 border rounded-lg">
          <h3 className="font-bold mb-2">Playmaking</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('AST')}
            >
              Assist
            </button>
            <button 
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('STL')}
            >
              Steal
            </button>
            <button 
              className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('BLK')}
            >
              Block
            </button>
          </div>
        </div>
        
        {/* Turnovers & Fouls */}
        <div className="p-3 border rounded-lg">
          <h3 className="font-bold mb-2">Mistakes</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-800 dark:text-orange-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('TO')}
            >
              Turnover
            </button>
            <button 
              className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-800 dark:text-orange-200 font-bold py-2 px-3 rounded"
              onClick={() => onRecordStat('FOUL')}
            >
              Foul
            </button>
          </div>
        </div>
      </div>
      
      {/* Player Stats Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-3">Current Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.PTS}</p>
            <p className="text-xs">Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {`${stats['2PT_MADE'] + stats['3PT_MADE']}/${stats['2PT_MADE'] + stats['3PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MISS']}`}
            </p>
            <p className="text-xs">FG</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {`${stats['3PT_MADE']}/${stats['3PT_MADE'] + stats['3PT_MISS']}`}
            </p>
            <p className="text-xs">3PT</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {stats['REB_OFF'] + stats['REB_DEF']}
            </p>
            <p className="text-xs">Rebounds</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.AST}</p>
            <p className="text-xs">Assists</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.STL + stats.BLK}</p>
            <p className="text-xs">STL+BLK</p>
          </div>
        </div>
        
        {/* Shooting Percentages */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-bold">2PT: {fg2Percentage}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: fg2Percentage }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">3PT: {fg3Percentage}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: fg3Percentage }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">FT: {ftPercentage}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: ftPercentage }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
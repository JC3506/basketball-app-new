'use client'

import { useState } from 'react'
import { useBasketballStore } from '@/lib/store'
import EnhancedShotChart from './EnhancedShotChart'

// Court dimensions
const courtWidth = 500
const courtHeight = 470
const threePointRadius = 237.5

interface ShotInputProps {
  gameId: string
}

export default function ShotInput({ gameId }: ShotInputProps) {
  // State
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedDefender, setSelectedDefender] = useState<string>('')
  const [shotType, setShotType] = useState<'2PT' | '3PT' | 'FT'>('2PT')
  const [shotMade, setShotMade] = useState<boolean>(true)
  const [shotPosition, setShotPosition] = useState<{ x: number, y: number } | null>(null)
  
  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const recordShot = useBasketballStore(state => state.recordShot)
  const currentQuarter = game?.quarter || 1
  
  // Handle court click to set shot position
  const handleCourtClick = (x: number, y: number) => {
    setShotPosition({ x, y })
    
    // Automatically determine shot type based on position
    const basketY = 25
    const distanceFromBasket = Math.sqrt(
      Math.pow(x - courtWidth/2, 2) + 
      Math.pow(y - basketY, 2)
    )
    
    // Check if shot is beyond the three-point line
    if (
      distanceFromBasket > threePointRadius || 
      (y > courtHeight - 50 && (x < 0 || x > courtWidth))
    ) {
      setShotType('3PT')
    } else {
      setShotType('2PT')
    }
  }
  
  // Handle shot recording
  const handleRecordShot = () => {
    if (!selectedPlayer || !shotPosition) return
    
    recordShot(gameId, {
      x: shotPosition.x,
      y: shotPosition.y,
      made: shotMade,
      playerId: selectedPlayer,
      defenderId: selectedDefender || undefined,
      shotType,
      quarter: currentQuarter
    })
    
    // Reset form for next shot
    setShotPosition(null)
    setShotMade(true)
    setSelectedDefender('')
  }
  
  // Handle free throw recording (no position needed)
  const handleRecordFreeThrow = () => {
    if (!selectedPlayer) return
    
    recordShot(gameId, {
      x: courtWidth / 2,
      y: 190, // Free throw line position
      made: shotMade,
      playerId: selectedPlayer,
      defenderId: undefined,
      shotType: 'FT',
      quarter: currentQuarter
    })
    
    // Reset form for next shot
    setShotMade(true)
  }
  
  return (
    <div className="card">
      <h2 className="card-header">Record Shot</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Shot chart */}
        <div>
          <EnhancedShotChart 
            gameId={gameId} 
            showControls={false} 
            interactive={true} 
            onCourtClick={handleCourtClick}
          />
          
          {shotPosition && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium">
                Shot position selected: ({shotPosition.x.toFixed(1)}, {shotPosition.y.toFixed(1)})
              </p>
              <p className="text-sm">
                Shot type: <span className="font-bold">{shotType}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Right column - Shot details form */}
        <div>
          <div className="space-y-4">
            {/* Player selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Player</label>
              <select 
                className="input-field"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
              >
                <option value="">Select Player</option>
                {game?.players
                  .filter(player => player.isActive)
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </option>
                  ))
                }
              </select>
            </div>
            
            {/* Defender selection (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">Defender (Optional)</label>
              <select 
                className="input-field"
                value={selectedDefender}
                onChange={(e) => setSelectedDefender(e.target.value)}
              >
                <option value="">No Defender / Unknown</option>
                {game?.opponent && (
                  <option value={`opponent-team`}>
                    {game.opponent} (Team)
                  </option>
                )}
              </select>
            </div>
            
            {/* Shot type selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Shot Type</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md ${shotType === '2PT' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => setShotType('2PT')}
                >
                  2PT
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md ${shotType === '3PT' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => setShotType('3PT')}
                >
                  3PT
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md ${shotType === 'FT' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => setShotType('FT')}
                >
                  FT
                </button>
              </div>
            </div>
            
            {/* Shot result */}
            <div>
              <label className="block text-sm font-medium mb-1">Shot Result</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md ${shotMade ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => setShotMade(true)}
                >
                  Made
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md ${!shotMade ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onClick={() => setShotMade(false)}
                >
                  Missed
                </button>
              </div>
            </div>
            
            {/* Record shot button */}
            <div className="pt-4">
              {shotType === 'FT' ? (
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={!selectedPlayer}
                  onClick={handleRecordFreeThrow}
                >
                  Record Free Throw
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={!selectedPlayer || !shotPosition}
                  onClick={handleRecordShot}
                >
                  Record Shot
                </button>
              )}
            </div>
            
            {/* Instructions */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Click on the court to select shot position.</p>
              <p>For free throws, no position selection is needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
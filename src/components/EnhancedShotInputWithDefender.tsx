'use client'

import { useState } from 'react'
import { useBasketballStore } from '@/lib/store'
import EnhancedShotChart from './EnhancedShotChart'
import { ContestLevel, DefenderInfo } from './defensive-impact-types'

// Court dimensions
const courtWidth = 500
const courtHeight = 470
const threePointRadius = 237.5

interface EnhancedShotInputProps {
  gameId: string
}

export default function EnhancedShotInputWithDefender({ gameId }: EnhancedShotInputProps) {
  // State
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedDefender, setSelectedDefender] = useState<string>('')
  const [shotType, setShotType] = useState<'2PT' | '3PT' | 'FT'>('2PT')
  const [shotMade, setShotMade] = useState<boolean>(true)
  const [shotPosition, setShotPosition] = useState<{ x: number, y: number } | null>(null)
  const [defenderPosition, setDefenderPosition] = useState<{ x: number, y: number } | null>(null)
  const [contestLevel, setContestLevel] = useState<ContestLevel>(ContestLevel.UNCONTESTED)
  const [positionMode, setPositionMode] = useState<'shooter' | 'defender'>('shooter')
  
  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const recordShotWithDefender = useBasketballStore(state => 
    (state as any).recordShotWithDefender || state.recordShot) // Fallback to recordShot if enhanced version not available
  const currentQuarter = game?.quarter || 1
  
  // Handle court click to set positions
  const handleCourtClick = (x: number, y: number) => {
    if (positionMode === 'shooter') {
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
      
      // Switch to defender position mode if defender is selected
      if (selectedDefender) {
        setPositionMode('defender')
      }
    } else {
      setDefenderPosition({ x, y })
      
      // Calculate distance between shooter and defender
      if (shotPosition) {
        const distance = Math.sqrt(
          Math.pow(shotPosition.x - x, 2) + 
          Math.pow(shotPosition.y - y, 2)
        )
        
        // Auto-determine contest level based on distance
        if (distance < 20) {
          setContestLevel(ContestLevel.HEAVY_CONTEST)
        } else if (distance < 40) {
          setContestLevel(ContestLevel.MEDIUM_CONTEST)
        } else if (distance < 60) {
          setContestLevel(ContestLevel.LIGHT_CONTEST)
        } else {
          setContestLevel(ContestLevel.UNCONTESTED)
        }
      }
    }
  }
  
  // Handle shot recording
  const handleRecordShot = () => {
    if (!selectedPlayer || !shotPosition) return
    
    // Create defender info if available
    let defenderInfo: DefenderInfo | undefined = undefined
    
    if (selectedDefender && defenderPosition) {
      const defender = game?.players.find(p => p.id === selectedDefender)
      
      defenderInfo = {
        id: selectedDefender,
        name: defender?.name || 'Unknown Defender',
        position: defenderPosition,
        contestLevel,
        distance: 0 // Will be calculated in the store
      }
    }
    
    recordShotWithDefender(gameId, {
      x: shotPosition.x,
      y: shotPosition.y,
      made: shotMade,
      playerId: selectedPlayer,
      shotType,
      quarter: currentQuarter,
      defender: defenderInfo,
      contestLevel
    })
    
    // Reset form for next shot
    setShotPosition(null)
    setDefenderPosition(null)
    setShotMade(true)
    setSelectedDefender('')
    setContestLevel(ContestLevel.UNCONTESTED)
    setPositionMode('shooter')
  }
  
  // Handle free throw recording (no position needed)
  const handleRecordFreeThrow = () => {
    if (!selectedPlayer) return
    
    recordShotWithDefender(gameId, {
      x: courtWidth / 2,
      y: 190, // Free throw line position
      made: shotMade,
      playerId: selectedPlayer,
      shotType: 'FT',
      quarter: currentQuarter
    })
    
    // Reset form for next shot
    setShotMade(true)
  }
  
  return (
    <div className="card">
      <h2 className="card-header">Record Shot with Defensive Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Shot chart */}
        <div>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium">
              {positionMode === 'shooter' 
                ? 'Click on the court to select SHOOTER position' 
                : 'Click on the court to select DEFENDER position'}
            </p>
          </div>
          
          <EnhancedShotChart 
            gameId={gameId} 
            showControls={false} 
            interactive={true} 
            onCourtClick={handleCourtClick}
          />
          
          {shotPosition && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium">
                Shot position: ({shotPosition.x.toFixed(1)}, {shotPosition.y.toFixed(1)})
              </p>
              <p className="text-sm">
                Shot type: <span className="font-bold">{shotType}</span>
              </p>
              {defenderPosition && (
                <>
                  <p className="text-sm font-medium mt-2">
                    Defender position: ({defenderPosition.x.toFixed(1)}, {defenderPosition.y.toFixed(1)})
                  </p>
                  <p className="text-sm">
                    Contest level: <span className="font-bold">{contestLevel.replace('_', ' ')}</span>
                  </p>
                </>
              )}
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
            
            {/* Defender selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Defender</label>
              <select 
                className="input-field"
                value={selectedDefender}
                onChange={(e) => setSelectedDefender(e.target.value)}
              >
                <option value="">No Defender / Unknown</option>
                {game?.players
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </option>
                  ))
                }
                {game?.opponent && (
                  <option value={`opponent-team`}>
                    {game.opponent} (Team)
                  </option>
                )}
              </select>
            </div>
            
            {/* Contest level selection */}
            {selectedDefender && (
              <div>
                <label className="block text-sm font-medium mb-1">Contest Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-md text-xs ${contestLevel === ContestLevel.UNCONTESTED ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onClick={() => setContestLevel(ContestLevel.UNCONTESTED)}
                  >
                    Uncontested
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-md text-xs ${contestLevel === ContestLevel.LIGHT_CONTEST ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onClick={() => setContestLevel(ContestLevel.LIGHT_CONTEST)}
                  >
                    Light Contest
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-md text-xs ${contestLevel === ContestLevel.MEDIUM_CONTEST ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onClick={() => setContestLevel(ContestLevel.MEDIUM_CONTEST)}
                  >
                    Medium Contest
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-md text-xs ${contestLevel === ContestLevel.HEAVY_CONTEST ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onClick={() => setContestLevel(ContestLevel.HEAVY_CONTEST)}
                  >
                    Heavy Contest
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-md text-xs ${contestLevel === ContestLevel.BLOCKED ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onClick={() => setContestLevel(ContestLevel.BLOCKED)}
                  >
                    Blocked
                  </button>
                </div>
              </div>
            )}
            
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
            
            {/* Position mode toggle */}
            {selectedDefender && shotPosition && !defenderPosition && (
              <div className="pt-2">
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => setPositionMode('defender')}
                >
                  Set Defender Position
                </button>
              </div>
            )}
            
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
                  disabled={!selectedPlayer || !shotPosition || (selectedDefender && !defenderPosition)}
                  onClick={handleRecordShot}
                >
                  Record Shot
                </button>
              )}
            </div>
            
            {/* Instructions */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Click on the court to select shot position.</p>
              <p>If a defender is selected, click again to place the defender.</p>
              <p>For free throws, no position selection is needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
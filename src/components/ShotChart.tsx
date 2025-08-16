'use client'

import { useState, useEffect } from 'react'
import { useBasketballStore } from '@/lib/store'

const courtWidth = 500
const courtHeight = 470
const threePointRadius = 237.5
const freeThrowRadius = 60
const basketY = 25
const basketRadius = 9

interface Shot {
  x: number
  y: number
  made: boolean
  playerId: string
  gameId: string
  quarter: number
  timestamp: string
}

export default function ShotChart({ gameId }: { gameId: string }) {
  const [shots, setShots] = useState<Shot[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | 'all'>('all')
  const [heatmapMode, setHeatmapMode] = useState(false)
  
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  
  // In a real implementation, shots would be stored in the game state
  // For now, we'll generate some sample shots
  useEffect(() => {
    if (game) {
      const sampleShots: Shot[] = []
      
      // Generate 50 random shots
      for (let i = 0; i < 50; i++) {
        const playerIndex = Math.floor(Math.random() * game.players.length)
        const player = game.players[playerIndex]
        
        // Random position on court
        const x = Math.random() * courtWidth
        const y = Math.random() * (courtHeight - 50) + 50
        
        // Shots closer to basket are more likely to be made
        const distanceFromBasket = Math.sqrt(Math.pow(x - courtWidth/2, 2) + Math.pow(y - basketY, 2))
        const madeChance = Math.max(0.8 - (distanceFromBasket / 500), 0.2)
        const made = Math.random() < madeChance
        
        sampleShots.push({
          x,
          y,
          made,
          playerId: player.id,
          gameId,
          quarter: Math.floor(Math.random() * 4) + 1,
          timestamp: new Date().toISOString()
        })
      }
      
      setShots(sampleShots)
    }
  }, [game])
  
  const filteredShots = selectedPlayer === 'all' 
    ? shots 
    : shots.filter(shot => shot.playerId === selectedPlayer)
  
  const calculateEfficiency = (shots: Shot[]) => {
    if (shots.length === 0) return 0
    return shots.filter(shot => shot.made).length / shots.length * 100
  }
  
  const renderHeatmap = () => {
    // Simple heatmap implementation
    const zones = [
      { name: 'Left Corner 3', x: 0, y: courtHeight - 50, width: 100, height: 50, shots: [] as Shot[] },
      { name: 'Right Corner 3', x: courtWidth - 100, y: courtHeight - 50, width: 100, height: 50, shots: [] as Shot[] },
      { name: 'Top of Key 3', x: courtWidth/2 - 75, y: courtHeight - 200, width: 150, height: 50, shots: [] as Shot[] },
      { name: 'Paint', x: courtWidth/2 - 80, y: 0, width: 160, height: 190, shots: [] as Shot[] },
      { name: 'Mid-Range Left', x: 0, y: 50, width: courtWidth/2 - 80, height: courtHeight - 100, shots: [] as Shot[] },
      { name: 'Mid-Range Right', x: courtWidth/2 + 80, y: 50, width: courtWidth/2 - 80, height: courtHeight - 100, shots: [] as Shot[] },
    ]
    
    // Assign shots to zones
    filteredShots.forEach(shot => {
      for (const zone of zones) {
        if (
          shot.x >= zone.x && 
          shot.x <= zone.x + zone.width && 
          shot.y >= zone.y && 
          shot.y <= zone.y + zone.height
        ) {
          zone.shots.push(shot)
          break
        }
      }
    })
    
    return (
      <g>
        {zones.map((zone, i) => {
          const efficiency = calculateEfficiency(zone.shots)
          // Color based on efficiency: red (low) to green (high)
          const r = Math.floor(255 * (1 - efficiency/100))
          const g = Math.floor(255 * (efficiency/100))
          const b = 0
          const opacity = Math.min(0.7, 0.2 + zone.shots.length / 20)
          
          return (
            <rect 
              key={i}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={`rgba(${r}, ${g}, ${b}, ${opacity})`}
              stroke="white"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          )
        })}
        
        {zones.map((zone, i) => {
          if (zone.shots.length === 0) return null
          
          const efficiency = calculateEfficiency(zone.shots)
          
          return (
            <text
              key={`text-${i}`}
              x={zone.x + zone.width/2}
              y={zone.y + zone.height/2}
              textAnchor="middle"
              fill="white"
              fontWeight="bold"
              fontSize="12"
            >
              {efficiency.toFixed(1)}%
              <tspan x={zone.x + zone.width/2} y={zone.y + zone.height/2 + 15} fontSize="10">
                ({zone.shots.length} shots)
              </tspan>
            </text>
          )
        })}
      </g>
    )
  }
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Shot Chart</h2>
        <div className="flex space-x-4">
          <select 
            className="input-field py-1 px-2 text-sm"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="all">All Players</option>
            {game?.players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} (#{player.number})
              </option>
            ))}
          </select>
          
          <button 
            className={`py-1 px-3 rounded text-sm ${heatmapMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setHeatmapMode(!heatmapMode)}
          >
            {heatmapMode ? 'Show Shots' : 'Show Heatmap'}
          </button>
        </div>
      </div>
      
      <div className="relative w-full" style={{ maxWidth: `${courtWidth}px`, margin: '0 auto' }}>
        <svg 
          viewBox={`0 0 ${courtWidth} ${courtHeight}`} 
          className="w-full h-auto border border-gray-300 bg-blue-50"
        >
          {/* Court markings */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          
          {/* Baseline */}
          <line x1="0" y1="0" x2={courtWidth} y2="0" stroke="#334155" strokeWidth="2" />
          
          {/* Paint area */}
          <rect x={courtWidth/2 - 80} y="0" width="160" height="190" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
          
          {/* Free throw circle */}
          <circle cx={courtWidth/2} cy="190" r={freeThrowRadius} stroke="#334155" strokeWidth="2" fill="none" />
          <line x1={courtWidth/2 - 80} y1="190" x2={courtWidth/2 + 80} y2="190" stroke="#334155" strokeWidth="2" />
          
          {/* Three point line */}
          <path 
            d={`M0,${courtHeight - 50} A${threePointRadius},${threePointRadius} 0 0,1 ${courtWidth},${courtHeight - 50}`} 
            stroke="#334155" 
            strokeWidth="2" 
            fill="none" 
          />
          <line x1="0" y1={courtHeight - 50} x2="0" y2={courtHeight} stroke="#334155" strokeWidth="2" />
          <line x1={courtWidth} y1={courtHeight - 50} x2={courtWidth} y2={courtHeight} stroke="#334155" strokeWidth="2" />
          
          {/* Center court */}
          <line x1="0" y1={courtHeight/2} x2={courtWidth} y2={courtHeight/2} stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx={courtWidth/2} cy={courtHeight/2} r="60" stroke="#334155" strokeWidth="2" fill="none" />
          
          {/* Basket */}
          <circle cx={courtWidth/2} cy={basketY} r={basketRadius} fill="#ef4444" stroke="#334155" strokeWidth="2" />
          
          {/* Backboard */}
          <line x1={courtWidth/2 - 30} y1="0" x2={courtWidth/2 + 30} y2="0" stroke="#334155" strokeWidth="4" />
          
          {/* Shots or heatmap */}
          {heatmapMode ? (
            renderHeatmap()
          ) : (
            filteredShots.map((shot, i) => (
              <circle 
                key={i}
                cx={shot.x}
                cy={shot.y}
                r="5"
                fill={shot.made ? "#22c55e" : "#ef4444"}
                stroke="white"
                strokeWidth="1"
              />
            ))
          )}
        </svg>
        
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            Made: {filteredShots.filter(s => s.made).length}
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            Missed: {filteredShots.filter(s => !s.made).length}
          </div>
          <div>
            <span className="font-bold">Efficiency: </span>
            {calculateEfficiency(filteredShots).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
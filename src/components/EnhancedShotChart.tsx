'use client'

import { useState, useEffect } from 'react'
import { useBasketballStore } from '@/lib/store'
import { Shot } from '@/lib/store' // Import the Shot interface

// Court dimensions
const courtWidth = 500
const courtHeight = 470
const threePointRadius = 237.5
const freeThrowRadius = 60
const basketY = 25
const basketRadius = 9

// Shot zone definitions
const shotZones = [
  { name: 'Left Corner 3', color: '#3b82f6' },
  { name: 'Right Corner 3', color: '#3b82f6' },
  { name: 'Above Break 3', color: '#3b82f6' },
  { name: 'Paint', color: '#f59e0b' },
  { name: 'Mid-Range Left', color: '#a855f7' },
  { name: 'Mid-Range Right', color: '#a855f7' },
]

interface EnhancedShotChartProps {
  gameId: string
  showControls?: boolean
  height?: number
  width?: number
  interactive?: boolean
  onCourtClick?: (x: number, y: number) => void
}

export default function EnhancedShotChart({
  gameId,
  showControls = true,
  height = 470,
  width = 500,
  interactive = false,
  onCourtClick
}: EnhancedShotChartProps) {
  // State
  const [selectedPlayer, setSelectedPlayer] = useState<string | 'all'>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all')
  const [selectedShotType, setSelectedShotType] = useState<'all' | '2PT' | '3PT' | 'FT'>('all')
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  
  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const getShotsByGame = useBasketballStore(state => state.getShotsByGame)
  const getShotEfficiency = useBasketballStore(state => state.getShotEfficiency)
  
  // Get shots for this game
  const shots = getShotsByGame(gameId) || []
  
  // Filter shots based on selections
  const filteredShots = shots.filter(shot => {
    const playerMatch = selectedPlayer === 'all' || shot.playerId === selectedPlayer
    const quarterMatch = selectedQuarter === 'all' || shot.quarter === selectedQuarter
    const shotTypeMatch = selectedShotType === 'all' || shot.shotType === selectedShotType
    return playerMatch && quarterMatch && shotTypeMatch
  })
  
  // Calculate zone statistics
  const zoneStats = shotZones.reduce((acc, zone) => {
    const zoneShots = filteredShots.filter(shot => shot.position?.zone === zone.name)
    const stats = getShotEfficiency(zoneShots)
    
    acc[zone.name] = {
      ...stats,
      color: zone.color
    }
    
    return acc
  }, {} as Record<string, { made: number; missed: number; total: number; efficiency: number; color: string }>)
  
  // Handle court click for interactive mode
  const handleCourtClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onCourtClick) return
    
    // Get SVG coordinates
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (courtWidth / rect.width)
    const y = (e.clientY - rect.top) * (courtHeight / rect.height)
    
    onCourtClick(x, y)
  }
  
  // Render heatmap based on shooting efficiency
  const renderHeatmap = () => {
    // Define court zones
    const zones = [
      { name: 'Left Corner 3', path: `M0,${courtHeight - 50} L0,${courtHeight} L100,${courtHeight} L100,${courtHeight - 50} Z` },
      { name: 'Right Corner 3', path: `M${courtWidth - 100},${courtHeight - 50} L${courtWidth - 100},${courtHeight} L${courtWidth},${courtHeight} L${courtWidth},${courtHeight - 50} Z` },
      { name: 'Above Break 3', path: `M0,${courtHeight - 50} A${threePointRadius},${threePointRadius} 0 0,1 ${courtWidth},${courtHeight - 50} L${courtWidth - 100},${courtHeight - 50} L100,${courtHeight - 50} Z` },
      { name: 'Paint', path: `M${courtWidth/2 - 80},0 L${courtWidth/2 + 80},0 L${courtWidth/2 + 80},190 L${courtWidth/2 - 80},190 Z` },
      { name: 'Mid-Range Left', path: `M0,0 L${courtWidth/2 - 80},0 L${courtWidth/2 - 80},190 A${freeThrowRadius},${freeThrowRadius} 0 0,0 ${courtWidth/2 - 80},${courtHeight - 50} L0,${courtHeight - 50} Z` },
      { name: 'Mid-Range Right', path: `M${courtWidth/2 + 80},0 L${courtWidth},0 L${courtWidth},${courtHeight - 50} L${courtWidth/2 + 80},${courtHeight - 50} A${freeThrowRadius},${freeThrowRadius} 0 0,1 ${courtWidth/2 + 80},190 Z` },
    ]
    
    return (
      <g>
        {zones.map((zone, i) => {
          const stats = zoneStats[zone.name] || { efficiency: 0, total: 0, color: '#888' }
          const opacity = Math.min(0.8, 0.2 + (stats.total / 10) * 0.6)
          
          // Color based on efficiency: red (low) to green (high)
          const efficiencyColor = stats.total > 0 
            ? `hsl(${Math.min(stats.efficiency, 100) * 1.2}, 80%, 50%)`
            : 'rgba(200, 200, 200, 0.3)'
          
          return (
            <path
              key={i}
              d={zone.path}
              fill={efficiencyColor}
              opacity={opacity}
              stroke="white"
              strokeWidth="1"
              onMouseEnter={() => setHoveredZone(zone.name)}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )
        })}
        
        {zones.map((zone, i) => {
          const stats = zoneStats[zone.name]
          if (!stats || stats.total === 0) return null
          
          // Calculate zone center for text placement
          let cx = 0, cy = 0
          
          if (zone.name === 'Left Corner 3') {
            cx = 50
            cy = courtHeight - 25
          } else if (zone.name === 'Right Corner 3') {
            cx = courtWidth - 50
            cy = courtHeight - 25
          } else if (zone.name === 'Above Break 3') {
            cx = courtWidth / 2
            cy = courtHeight - 100
          } else if (zone.name === 'Paint') {
            cx = courtWidth / 2
            cy = 95
          } else if (zone.name === 'Mid-Range Left') {
            cx = courtWidth / 4
            cy = courtHeight / 2
          } else if (zone.name === 'Mid-Range Right') {
            cx = courtWidth * 3 / 4
            cy = courtHeight / 2
          }
          
          return (
            <g key={`text-${i}`}>
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                fill="white"
                fontWeight="bold"
                fontSize="12"
                stroke="black"
                strokeWidth="0.5"
                paintOrder="stroke"
              >
                {stats.efficiency.toFixed(1)}%
              </text>
              <text
                x={cx}
                y={cy + 15}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                stroke="black"
                strokeWidth="0.5"
                paintOrder="stroke"
              >
                ({stats.made}/{stats.total})
              </text>
            </g>
          )
        })}
      </g>
    )
  }
  
  // Render zone tooltip when hovering over a zone in heatmap mode
  const renderZoneTooltip = () => {
    if (!hoveredZone || !heatmapMode) return null
    
    const stats = zoneStats[hoveredZone]
    if (!stats) return null
    
    return (
      <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded shadow-md text-sm z-10">
        <div className="font-bold">{hoveredZone}</div>
        <div>Made: {stats.made} | Missed: {stats.missed}</div>
        <div>Efficiency: {stats.efficiency.toFixed(1)}%</div>
      </div>
    )
  }
  
  // Calculate overall shooting efficiency
  const overallStats = getShotEfficiency(filteredShots)
  
  return (
    <div className="card">
      {showControls && (
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-bold">Shot Chart</h2>
          <div className="flex flex-wrap gap-2">
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
            
            <select 
              className="input-field py-1 px-2 text-sm"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Quarters</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            
            <select 
              className="input-field py-1 px-2 text-sm"
              value={selectedShotType}
              onChange={(e) => setSelectedShotType(e.target.value as any)}
            >
              <option value="all">All Shots</option>
              <option value="2PT">2PT</option>
              <option value="3PT">3PT</option>
              <option value="FT">FT</option>
            </select>
            
            <button 
              className={`py-1 px-3 rounded text-sm ${heatmapMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setHeatmapMode(!heatmapMode)}
            >
              {heatmapMode ? 'Show Shots' : 'Show Heatmap'}
            </button>
          </div>
        </div>
      )}
      
      <div className="relative w-full" style={{ maxWidth: `${width}px`, margin: '0 auto' }}>
        {renderZoneTooltip()}
        
        <svg 
          viewBox={`0 0 ${courtWidth} ${courtHeight}`} 
          className={`w-full h-auto border border-gray-300 bg-blue-50 ${interactive ? 'cursor-crosshair' : ''}`}
          onClick={handleCourtClick}
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
            filteredShots.map((shot) => (
              <circle 
                key={shot.id}
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
            Made: {overallStats.made}
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            Missed: {overallStats.missed}
          </div>
          <div>
            <span className="font-bold">Efficiency: </span>
            {overallStats.efficiency.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
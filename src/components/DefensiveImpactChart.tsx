'use client'

import { useState, useEffect } from 'react'
import { useBasketballStore } from '@/lib/store'
import { ContestLevel, DefenderImpact } from './defensive-impact-types'

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

interface DefensiveImpactChartProps {
  gameId: string
  showControls?: boolean
  height?: number
  width?: number
}

export default function DefensiveImpactChart({
  gameId,
  showControls = true,
  height = 470,
  width = 500,
}: DefensiveImpactChartProps) {
  // State
  const [selectedDefender, setSelectedDefender] = useState<string | 'all'>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all')
  const [visualizationMode, setVisualizationMode] = useState<'coverage' | 'efficiency' | 'contest-level'>('coverage')
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  
  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const getTeamDefensiveImpact = useBasketballStore(state => 
    (state as any).getTeamDefensiveImpact || (() => ({ totalContests: 0, successfulContests: 0, contestEfficiency: 0, contestsByLevel: {}, zoneDefenseEfficiency: {} })))
  const getDefenderImpact = useBasketballStore(state => 
    (state as any).getDefenderImpact || (() => ({ totalContests: 0, successfulContests: 0, contestEfficiency: 0, avgContestDistance: 0, contestsByLevel: {}, impactByZone: {} })))
  
  // Get defensive impact data
  const teamDefensiveImpact = getTeamDefensiveImpact(gameId)
  const defenderImpact = selectedDefender !== 'all' ? getDefenderImpact(gameId, selectedDefender) : null
  
  // Get zone data based on selected defender
  const zoneData = selectedDefender === 'all' 
    ? teamDefensiveImpact.zoneDefenseEfficiency
    : defenderImpact?.impactByZone || {}
  
  // Render zone tooltip when hovering over a zone
  const renderZoneTooltip = () => {
    if (!hoveredZone) return null
    
    const zoneInfo = zoneData[hoveredZone]
    if (!zoneInfo) return null
    
    return (
      <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded shadow-md text-sm z-10">
        <div className="font-bold">{hoveredZone}</div>
        <div>Contests: {zoneInfo.contests}</div>
        <div>Successful Contests: {zoneInfo.successfulContests}</div>
        <div>Defensive Efficiency: {zoneInfo.efficiency.toFixed(1)}%</div>
      </div>
    )
  }
  
  // Render defensive coverage heatmap
  const renderCoverageHeatmap = () => {
    // Define court zones
    const zones = [
      { name: 'Left Corner 3', path: `M0,${courtHeight - 50} L0,${courtHeight} L100,${courtHeight} L100,${courtHeight - 50} Z` },
      { name: 'Right Corner 3', path: `M${courtWidth - 100},${courtHeight - 50} L${courtWidth - 100},${courtHeight} L${courtWidth},${courtHeight} L${courtWidth},${courtHeight - 50} Z` },
      { name: 'Above Break 3', path: `M0,${courtHeight - 50} A${threePointRadius},${threePointRadius} 0 0,1 ${courtWidth},${courtHeight - 50} L${courtWidth - 100},${courtHeight - 50} L100,${courtHeight - 50} Z` },
      { name: 'Paint', path: `M${courtWidth/2 - 80},0 L${courtWidth/2 + 80},0 L${courtWidth/2 + 80},190 L${courtWidth/2 - 80},190 Z` },
      { name: 'Mid-Range Left', path: `M0,0 L${courtWidth/2 - 80},0 L${courtWidth/2 - 80},190 A${freeThrowRadius},${freeThrowRadius} 0 0,0 ${courtWidth/2 - 80},${courtHeight - 50} L0,${courtHeight - 50} Z` },
      { name: 'Mid-Range Right', path: `M${courtWidth/2 + 80},0 L${courtWidth},0 L${courtWidth},${courtHeight - 50} L${courtWidth/2 + 80},${courtHeight - 50} A${freeThrowRadius},${freeThrowRadius} 0 0,1 ${courtWidth/2 + 80},190 Z` },
    ]
    
    // Find max contests for normalization
    const maxContests = Math.max(
      ...Object.values(zoneData).map(zone => zone.contests || 0),
      1 // Prevent division by zero
    )
    
    return (
      <g>
        {zones.map((zone, i) => {
          const stats = zoneData[zone.name] || { contests: 0, successfulContests: 0, efficiency: 0 }
          
          // Coverage intensity based on number of contests
          const coverageIntensity = Math.min(0.8, 0.2 + (stats.contests / maxContests) * 0.6)
          
          // Color based on visualization mode
          let fillColor = '#3b82f6' // Default blue
          
          if (visualizationMode === 'efficiency') {
            // Efficiency: red (low) to green (high)
            fillColor = stats.contests > 0 
              ? `hsl(${Math.min(stats.efficiency, 100) * 1.2}, 80%, 50%)`
              : 'rgba(200, 200, 200, 0.3)'
          } else if (visualizationMode === 'contest-level') {
            // Contest level: yellow (light) to red (heavy)
            fillColor = '#f59e0b' // Default amber
          }
          
          return (
            <path
              key={i}
              d={zone.path}
              fill={fillColor}
              opacity={coverageIntensity}
              stroke="white"
              strokeWidth="1"
              onMouseEnter={() => setHoveredZone(zone.name)}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )
        })}
        
        {zones.map((zone, i) => {
          const stats = zoneData[zone.name]
          if (!stats || stats.contests === 0) return null
          
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
          
          // Text content based on visualization mode
          let primaryText = ''
          let secondaryText = ''
          
          if (visualizationMode === 'coverage') {
            primaryText = `${stats.contests}`
            secondaryText = 'contests'
          } else if (visualizationMode === 'efficiency') {
            primaryText = `${stats.efficiency.toFixed(1)}%`
            secondaryText = `(${stats.successfulContests}/${stats.contests})`
          } else if (visualizationMode === 'contest-level') {
            primaryText = `${stats.contests}`
            secondaryText = 'contests'
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
                {primaryText}
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
                {secondaryText}
              </text>
            </g>
          )
        })}
      </g>
    )
  }
  
  // Calculate overall defensive metrics
  const overallDefensiveStats = selectedDefender === 'all'
    ? {
        totalContests: teamDefensiveImpact.totalContests,
        successfulContests: teamDefensiveImpact.successfulContests,
        efficiency: teamDefensiveImpact.contestEfficiency
      }
    : {
        totalContests: defenderImpact?.totalContests || 0,
        successfulContests: defenderImpact?.successfulContests || 0,
        efficiency: defenderImpact?.contestEfficiency || 0
      }
  
  return (
    <div className="card">
      {showControls && (
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-bold">Defensive Impact</h2>
          <div className="flex flex-wrap gap-2">
            <select 
              className="input-field py-1 px-2 text-sm"
              value={selectedDefender}
              onChange={(e) => setSelectedDefender(e.target.value)}
            >
              <option value="all">All Defenders</option>
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
              value={visualizationMode}
              onChange={(e) => setVisualizationMode(e.target.value as any)}
            >
              <option value="coverage">Coverage</option>
              <option value="efficiency">Defensive Efficiency</option>
              <option value="contest-level">Contest Level</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="relative w-full" style={{ maxWidth: `${width}px`, margin: '0 auto' }}>
        {renderZoneTooltip()}
        
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
          
          {/* Defensive coverage visualization */}
          {renderCoverageHeatmap()}
        </svg>
        
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <span className="font-bold">Total Contests: </span>
            {overallDefensiveStats.totalContests}
          </div>
          <div>
            <span className="font-bold">Successful Contests: </span>
            {overallDefensiveStats.successfulContests}
          </div>
          <div>
            <span className="font-bold">Defensive Efficiency: </span>
            {overallDefensiveStats.efficiency.toFixed(1)}%
          </div>
        </div>
        
        {/* Contest level breakdown */}
        {visualizationMode === 'contest-level' && (
          <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
            {Object.values(ContestLevel).map((level) => {
              const contestCount = selectedDefender === 'all'
                ? teamDefensiveImpact.contestsByLevel?.[level] || 0
                : defenderImpact?.contestsByLevel?.[level] || 0
              
              const totalContests = overallDefensiveStats.totalContests || 1 // Prevent division by zero
              const percentage = (contestCount / totalContests) * 100
              
              return (
                <div key={level} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
                  <div className="font-medium">{level.replace('_', ' ')}</div>
                  <div className="mt-1">{contestCount} ({percentage.toFixed(1)}%)</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Game, Player, PlayerStats, useBasketballStore } from '@/lib/store'
import { ContestLevel, DefenderImpact } from './defensive-impact-types'

interface EnhancedDefensiveAIInsightsProps {
  gameId: string;
}

export default function EnhancedDefensiveAIInsights({ gameId }: EnhancedDefensiveAIInsightsProps) {
  const [activeTab, setActiveTab] = useState<'shooting' | 'chemistry' | 'defense' | 'matchups'>('defense')
  
  // Get game from store using gameId
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const getTeamDefensiveImpact = useBasketballStore(state => 
    (state as any).getTeamDefensiveImpact || (() => ({ totalContests: 0, successfulContests: 0, contestEfficiency: 0, contestsByLevel: {}, zoneDefenseEfficiency: {} })))
  const getDefenderImpact = useBasketballStore(state => 
    (state as any).getDefenderImpact || (() => ({ totalContests: 0, successfulContests: 0, contestEfficiency: 0, avgContestDistance: 0, contestsByLevel: {}, impactByZone: {} })))
  const getPlayerMatchupStats = useBasketballStore(state => 
    (state as any).getPlayerMatchupStats || (() => ({ totalShots: 0, madeShots: 0, efficiency: 0, avgContestLevel: ContestLevel.UNCONTESTED })))
  
  if (!game) {
    return <div className="card p-4">Game not found</div>
  }
  
  // Generate shooting efficiency insights (from original component)
  const generateShootingInsights = () => {
    const insights = []
    
    // Team shooting insights
    let totalFGAttempts = 0
    let totalFGMade = 0
    let total3PTAttempts = 0
    let total3PTMade = 0
    
    Object.entries(game.playerStats).forEach(([playerId, stats]) => {
      totalFGAttempts += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
      totalFGMade += stats['2PT_MADE'] + stats['3PT_MADE']
      total3PTAttempts += stats['3PT_MADE'] + stats['3PT_MISS']
      total3PTMade += stats['3PT_MADE']
    })
    
    const fgPercentage = totalFGAttempts > 0 ? (totalFGMade / totalFGAttempts) * 100 : 0
    const threePtPercentage = total3PTAttempts > 0 ? (total3PTMade / total3PTAttempts) * 100 : 0
    
    // Team shooting insights
    if (fgPercentage > 50) {
      insights.push({
        type: 'positive',
        text: `Team shooting efficiency is excellent at ${fgPercentage.toFixed(1)}%. Continue to focus on high-percentage shots.`
      })
    } else if (fgPercentage < 40) {
      insights.push({
        type: 'negative',
        text: `Team shooting efficiency is low at ${fgPercentage.toFixed(1)}%. Consider working on shot selection and offensive execution.`
      })
    }
    
    if (threePtPercentage > 40) {
      insights.push({
        type: 'positive',
        text: `Three-point shooting is strong at ${threePtPercentage.toFixed(1)}%. Leverage this advantage by creating more perimeter opportunities.`
      })
    } else if (threePtPercentage < 30 && total3PTAttempts > 10) {
      insights.push({
        type: 'negative',
        text: `Three-point shooting is struggling at ${threePtPercentage.toFixed(1)}%. Consider focusing more on inside scoring or mid-range shots.`
      })
    }
    
    // Individual player insights
    game.players.forEach(player => {
      const stats = game.playerStats[player.id]
      if (!stats) return
      
      const twoPointAttempts = stats['2PT_MADE'] + stats['2PT_MISS']
      const twoPointPercentage = twoPointAttempts > 0 ? (stats['2PT_MADE'] / twoPointAttempts) * 100 : 0
      
      const threePointAttempts = stats['3PT_MADE'] + stats['3PT_MISS']
      const threePointPercentage = threePointAttempts > 0 ? (stats['3PT_MADE'] / threePointAttempts) * 100 : 0
      
      if (twoPointAttempts >= 5 && twoPointPercentage > 60) {
        insights.push({
          type: 'positive',
          text: `${player.name} is highly efficient in the paint (${twoPointPercentage.toFixed(1)}%). Consider running more plays for them inside.`
        })
      }
      
      if (threePointAttempts >= 4 && threePointPercentage > 50) {
        insights.push({
          type: 'positive',
          text: `${player.name} is hot from beyond the arc (${threePointPercentage.toFixed(1)}%). Create more three-point opportunities for them.`
        })
      }
      
      if (twoPointAttempts >= 5 && twoPointPercentage < 30) {
        insights.push({
          type: 'negative',
          text: `${player.name} is struggling with inside shots (${twoPointPercentage.toFixed(1)}%). Consider adjusting their role in the offense.`
        })
      }
    })
    
    return insights.length > 0 ? insights : [{ type: 'neutral', text: 'No significant shooting patterns detected yet.' }]
  }
  
  // Generate player chemistry insights (from original component)
  const generateChemistryInsights = () => {
    // In a real implementation, this would analyze assist patterns, lineup effectiveness, etc.
    // For now, we'll generate some sample insights
    const insights = [
      {
        type: 'positive',
        text: 'Players #23 and #30 have connected on 5 assists this game, showing excellent chemistry on the perimeter.'
      },
      {
        type: 'positive',
        text: 'The starting lineup has outscored opponents by 12 points in 15 minutes of play.'
      },
      {
        type: 'negative',
        text: 'The bench unit is struggling with a -8 point differential. Consider adjusting rotations.'
      },
      {
        type: 'neutral',
        text: 'Small-ball lineup with #6 at center has shown promising ball movement but needs to improve rebounding.'
      }
    ]
    
    return insights
  }
  
  // Generate defensive adjustment insights - ENHANCED with real defensive data
  const generateDefensiveInsights = () => {
    const insights = []
    
    // Get team defensive impact data
    const teamDefensiveImpact = getTeamDefensiveImpact(gameId)
    
    // Team-level defensive insights
    if (teamDefensiveImpact.contestEfficiency > 60) {
      insights.push({
        type: 'positive',
        text: `Team defensive contesting is excellent at ${teamDefensiveImpact.contestEfficiency.toFixed(1)}% efficiency. Continue to emphasize active hands and proper positioning.`
      })
    } else if (teamDefensiveImpact.contestEfficiency < 40 && teamDefensiveImpact.totalContests > 10) {
      insights.push({
        type: 'negative',
        text: `Team defensive contesting is ineffective at ${teamDefensiveImpact.contestEfficiency.toFixed(1)}% efficiency. Focus on better closeouts and contest technique.`
      })
    }
    
    // Zone-specific insights
    const zoneEfficiency = teamDefensiveImpact.zoneDefenseEfficiency || {}
    
    // Check paint defense
    const paintDefense = zoneEfficiency['Paint']
    if (paintDefense && paintDefense.contests > 5) {
      if (paintDefense.efficiency > 60) {
        insights.push({
          type: 'positive',
          text: `Paint defense is strong at ${paintDefense.efficiency.toFixed(1)}% efficiency. Interior defenders are effectively protecting the rim.`
        })
      } else if (paintDefense.efficiency < 40) {
        insights.push({
          type: 'negative',
          text: `Paint defense is weak at ${paintDefense.efficiency.toFixed(1)}% efficiency. Consider adjusting interior defensive strategy.`
        })
      }
    }
    
    // Check perimeter defense
    const perimeter3PT = [
      zoneEfficiency['Left Corner 3'] || { contests: 0, efficiency: 0 },
      zoneEfficiency['Right Corner 3'] || { contests: 0, efficiency: 0 },
      zoneEfficiency['Above Break 3'] || { contests: 0, efficiency: 0 }
    ]
    
    const totalPerimeterContests = perimeter3PT.reduce((sum, zone) => sum + zone.contests, 0)
    const totalPerimeterSuccessful = perimeter3PT.reduce((sum, zone) => sum + zone.successfulContests, 0)
    const perimeterEfficiency = totalPerimeterContests > 0 
      ? (totalPerimeterSuccessful / totalPerimeterContests) * 100 
      : 0
    
    if (totalPerimeterContests > 5) {
      if (perimeterEfficiency > 60) {
        insights.push({
          type: 'positive',
          text: `Perimeter defense is excellent at ${perimeterEfficiency.toFixed(1)}% efficiency. Closeouts and rotations are working well.`
        })
      } else if (perimeterEfficiency < 40) {
        insights.push({
          type: 'negative',
          text: `Perimeter defense is struggling at ${perimeterEfficiency.toFixed(1)}% efficiency. Improve closeouts and consider adjusting defensive scheme.`
        })
      }
    }
    
    // Contest level insights
    const contestLevels = teamDefensiveImpact.contestsByLevel || {}
    const totalContests = teamDefensiveImpact.totalContests || 1 // Prevent division by zero
    
    const heavyContestPercentage = ((contestLevels[ContestLevel.HEAVY_CONTEST] || 0) / totalContests) * 100
    const lightContestPercentage = ((contestLevels[ContestLevel.LIGHT_CONTEST] || 0) / totalContests) * 100
    
    if (heavyContestPercentage > 50) {
      insights.push({
        type: 'positive',
        text: `Defense is applying heavy pressure with ${heavyContestPercentage.toFixed(1)}% of contests being heavily contested. This aggressive approach is disrupting the offense.`
      })
    } else if (lightContestPercentage > 60) {
      insights.push({
        type: 'negative',
        text: `Defense is not applying enough pressure with ${lightContestPercentage.toFixed(1)}% of contests being only lightly contested. More aggressive closeouts are needed.`
      })
    }
    
    // Individual defender insights
    game.players.forEach(player => {
      const defenderImpact = getDefenderImpact(gameId, player.id)
      
      if (defenderImpact.totalContests >= 5) {
        if (defenderImpact.contestEfficiency > 65) {
          insights.push({
            type: 'positive',
            text: `${player.name} is an excellent defender with ${defenderImpact.contestEfficiency.toFixed(1)}% contest efficiency. Consider assigning them to guard the opponent's best scorer.`
          })
        } else if (defenderImpact.contestEfficiency < 35) {
          insights.push({
            type: 'negative',
            text: `${player.name} is struggling defensively with ${defenderImpact.contestEfficiency.toFixed(1)}% contest efficiency. Consider adjusting their defensive assignments.`
          })
        }
        
        // Zone-specific defender insights
        Object.entries(defenderImpact.impactByZone).forEach(([zone, zoneData]) => {
          if (zoneData.contests >= 3) {
            if (zoneData.efficiency > 70) {
              insights.push({
                type: 'positive',
                text: `${player.name} is excellent at defending the ${zone.toLowerCase()} (${zoneData.efficiency.toFixed(1)}% efficiency). Utilize this strength in defensive matchups.`
              })
            }
          }
        })
      }
    })
    
    return insights.length > 0 ? insights : [{ type: 'neutral', text: 'Not enough defensive data collected yet for meaningful insights.' }]
  }
  
  // Generate matchup-specific insights
  const generateMatchupInsights = () => {
    const insights = []
    
    // In a real implementation, this would analyze all player matchups
    // For now, we'll generate insights for a few sample matchups
    game.players.forEach(defender => {
      game.players.forEach(offensive => {
        if (defender.id !== offensive.id) {
          const matchupStats = getPlayerMatchupStats(gameId, offensive.id, defender.id)
          
          if (matchupStats.totalShots >= 3) {
            if (matchupStats.efficiency < 30) {
              insights.push({
                type: 'positive',
                text: `${defender.name} is effectively defending ${offensive.name}, holding them to ${matchupStats.efficiency.toFixed(1)}% shooting efficiency. Continue this matchup.`
              })
            } else if (matchupStats.efficiency > 60) {
              insights.push({
                type: 'negative',
                text: `${offensive.name} is scoring efficiently (${matchupStats.efficiency.toFixed(1)}%) when defended by ${defender.name}. Consider switching this defensive assignment.`
              })
            }
            
            // Contest level insights
            if (matchupStats.avgContestLevel === ContestLevel.LIGHT_CONTEST && matchupStats.efficiency > 50) {
              insights.push({
                type: 'negative',
                text: `${defender.name} needs to contest ${offensive.name}'s shots more aggressively. Current light contests are not effective.`
              })
            } else if (matchupStats.avgContestLevel === ContestLevel.HEAVY_CONTEST && matchupStats.efficiency < 40) {
              insights.push({
                type: 'positive',
                text: `${defender.name}'s aggressive contests against ${offensive.name} are very effective. Continue this defensive approach.`
              })
            }
          }
        }
      })
    })
    
    return insights.length > 0 ? insights : [{ type: 'neutral', text: 'Not enough matchup data collected yet for meaningful insights.' }]
  }
  
  const activeInsights = () => {
    switch (activeTab) {
      case 'shooting':
        return generateShootingInsights()
      case 'chemistry':
        return generateChemistryInsights()
      case 'defense':
        return generateDefensiveInsights()
      case 'matchups':
        return generateMatchupInsights()
      default:
        return []
    }
  }
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Enhanced AI Insights</h2>
      
      <div className="flex border-b mb-4 overflow-x-auto">
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'shooting' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
          onClick={() => setActiveTab('shooting')}
        >
          Shooting
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'chemistry' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
          onClick={() => setActiveTab('chemistry')}
        >
          Chemistry
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'defense' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
          onClick={() => setActiveTab('defense')}
        >
          Defense
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'matchups' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
          onClick={() => setActiveTab('matchups')}
        >
          Matchups
        </button>
      </div>
      
      <div className="space-y-3">
        {activeInsights().map((insight, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg ${
              insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20' : 
              insight.type === 'negative' ? 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20' : 
              'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20'
            }`}
          >
            <p className="text-sm">
              {insight.type === 'positive' && <span className="font-bold text-green-600 dark:text-green-400">STRENGTH: </span>}
              {insight.type === 'negative' && <span className="font-bold text-red-600 dark:text-red-400">OPPORTUNITY: </span>}
              {insight.type === 'neutral' && <span className="font-bold text-blue-600 dark:text-blue-400">INSIGHT: </span>}
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

// Components
import Navbar from '@/components/Navbar'

// Store
import { useBasketballStore, Game, Player, PlayerStats } from '@/lib/store'

export default function Dashboard() {
  const games = useBasketballStore(state => state.games)
  const calculatePlayerEfficiency = useBasketballStore(state => state.calculatePlayerEfficiency)
  
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'game' | 'player' | 'team'>('game')
  
  // Set the first game as selected by default
  useEffect(() => {
    if (games.length > 0 && !selectedGame) {
      setSelectedGame(games[0].id)
    }
  }, [games, selectedGame])
  
  // Get the selected game data
  const gameData = games.find(game => game.id === selectedGame)
  
  // If no games are available
  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="container mx-auto py-8 px-4">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Games Available</h2>
            <p className="mb-6">You haven't tracked any games yet. Start by creating a new game.</p>
            <Link href="/new-game" className="btn-primary">
              Create New Game
            </Link>
          </div>
        </main>
      </div>
    )
  }
  
  // Calculate team totals for the selected game
  const calculateTeamTotals = (game: Game) => {
    const totals = {
      PTS: 0,
      REB: 0,
      AST: 0,
      STL: 0,
      BLK: 0,
      TO: 0
    }
    
    Object.values(game.playerStats).forEach(stats => {
      totals.PTS += stats.PTS
      totals.REB += stats['REB_OFF'] + stats['REB_DEF']
      totals.AST += stats.AST
      totals.STL += stats.STL
      totals.BLK += stats.BLK
      totals.TO += stats.TO
    })
    
    return totals
  }
  
  // Generate AI recommendations based on stats (simplified)
  const generateRecommendations = (game: Game) => {
    const recommendations = []
    
    // Check team shooting percentages
    let totalFGAttempts = 0
    let totalFGMade = 0
    let total3PTAttempts = 0
    let total3PTMade = 0
    
    Object.values(game.playerStats).forEach(stats => {
      totalFGAttempts += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
      totalFGMade += stats['2PT_MADE'] + stats['3PT_MADE']
      total3PTAttempts += stats['3PT_MADE'] + stats['3PT_MISS']
      total3PTMade += stats['3PT_MADE']
    })
    
    const fgPercentage = totalFGAttempts > 0 ? (totalFGMade / totalFGAttempts) * 100 : 0
    const threePtPercentage = total3PTAttempts > 0 ? (total3PTMade / total3PTAttempts) * 100 : 0
    
    if (fgPercentage < 40) {
      recommendations.push("Focus on improving shot selection and finishing at the rim.")
    }
    
    if (threePtPercentage < 30) {
      recommendations.push("Work on three-point shooting in practice sessions.")
    }
    
    // Check rebounding
    const teamTotals = calculateTeamTotals(game)
    if (teamTotals.REB < 35) {
      recommendations.push("Increase rebounding drills to improve board control.")
    }
    
    // Check turnovers
    if (teamTotals.TO > 15) {
      recommendations.push("Focus on ball security to reduce turnovers.")
    }
    
    // Check assists
    if (teamTotals.AST < 15) {
      recommendations.push("Improve ball movement and player movement off the ball.")
    }
    
    // If we don't have enough recommendations, add some generic ones
    if (recommendations.length < 3) {
      recommendations.push("Develop more set plays for your most efficient scorers.")
      recommendations.push("Implement more off-ball movement drills to improve scoring opportunities.")
      recommendations.push("Practice late-game situations to improve execution in close games.")
    }
    
    return recommendations.slice(0, 5) // Return up to 5 recommendations
  }
  
  // Get player trends across games
  const getPlayerTrends = (playerId: string) => {
    const playerGames = games
      .filter(game => game.players.some(p => p.id === playerId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-3) // Get last 3 games
    
    const trends = {
      scoring: [] as number[],
      efficiency: [] as number[],
      defense: [] as number[]
    }
    
    playerGames.forEach(game => {
      const stats = game.playerStats[playerId]
      if (stats) {
        trends.scoring.push(stats.PTS)
        
        // Calculate FG%
        const fgAttempts = stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
        const fgMade = stats['2PT_MADE'] + stats['3PT_MADE']
        const fgPercentage = fgAttempts > 0 ? (fgMade / fgAttempts) * 100 : 0
        trends.efficiency.push(parseFloat(fgPercentage.toFixed(1)))
        
        // Calculate defensive stats
        trends.defense.push(stats.STL + stats.BLK)
      }
    })
    
    return trends
  }
  
  // Get team trends across games
  const getTeamTrends = () => {
    const recentGames = [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-3) // Get last 3 games
    
    const trends = {
      scoring: [] as number[],
      defense: [] as number[],
      assists: [] as number[],
      rebounds: [] as number[],
      turnovers: [] as number[]
    }
    
    recentGames.forEach(game => {
      const totals = calculateTeamTotals(game)
      trends.scoring.push(game.score.team)
      trends.defense.push(game.score.opponent)
      trends.assists.push(totals.AST)
      trends.rebounds.push(totals.REB)
      trends.turnovers.push(totals.TO)
    })
    
    return trends
  }
  
  // If a game is selected, calculate team totals
  const teamTotals = gameData ? calculateTeamTotals(gameData) : null
  
  // If a game is selected, generate recommendations
  const recommendations = gameData ? generateRecommendations(gameData) : []
  
  // Get team trends
  const teamTrends = getTeamTrends()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title="Dashboard" />

      <main className="container mx-auto py-8 px-4">
        {/* Game Selection */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Game History</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Game</th>
                  <th className="py-3 px-4 text-left">Team</th>
                  <th className="py-3 px-4 text-left">Opponent</th>
                  <th className="py-3 px-4 text-left">Score</th>
                  <th className="py-3 px-4 text-left">Result</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr 
                    key={game.id} 
                    className={`border-b dark:border-gray-700 ${selectedGame === game.id ? 'bg-primary-50 dark:bg-primary-900' : ''}`}
                  >
                    <td className="py-3 px-4">{format(new Date(game.date), 'yyyy-MM-dd')}</td>
                    <td className="py-3 px-4">{game.name}</td>
                    <td className="py-3 px-4">{game.team}</td>
                    <td className="py-3 px-4">{game.opponent}</td>
                    <td className="py-3 px-4">{game.score.team} - {game.score.opponent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${game.score.team > game.score.opponent ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {game.score.team > game.score.opponent ? 'W' : 'L'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className={`${selectedGame === game.id ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} hover:bg-primary-700 hover:text-white font-bold py-1 px-3 rounded text-sm`}
                        onClick={() => setSelectedGame(game.id)}
                      >
                        {selectedGame === game.id ? 'Selected' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-bold ${activeTab === 'game' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setActiveTab('game')}
          >
            Game Analysis
          </button>
          <button 
            className={`py-2 px-4 font-bold ${activeTab === 'player' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setActiveTab('player')}
          >
            Player Trends
          </button>
          <button 
            className={`py-2 px-4 font-bold ${activeTab === 'team' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setActiveTab('team')}
          >
            Team Trends
          </button>
        </div>
        
        {/* Game Analysis Tab */}
        {activeTab === 'game' && gameData && teamTotals && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Game Summary */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Game Summary</h2>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <p className="text-sm font-bold">{gameData.team}</p>
                    <p className="text-4xl font-bold">{gameData.score.team}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm">vs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{gameData.opponent}</p>
                    <p className="text-4xl font-bold">{gameData.score.opponent}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm"><strong>Date:</strong> {format(new Date(gameData.date), 'yyyy-MM-dd')}</p>
                  <p className="text-sm"><strong>Game:</strong> {gameData.name}</p>
                  <p className="text-sm">
                    <strong>Result:</strong> 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${gameData.score.team > gameData.score.opponent ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {gameData.score.team > gameData.score.opponent ? 'Win' : 'Loss'}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Team Stats */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Team Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.PTS}</p>
                    <p className="text-xs">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.REB}</p>
                    <p className="text-xs">Rebounds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.AST}</p>
                    <p className="text-xs">Assists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.STL}</p>
                    <p className="text-xs">Steals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.BLK}</p>
                    <p className="text-xs">Blocks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{teamTotals.TO}</p>
                    <p className="text-xs">Turnovers</p>
                  </div>
                </div>
              </div>
              
              {/* AI Insights */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">AI Insights</h2>
                <ul className="space-y-2">
                  {gameData.insights.length > 0 ? (
                    gameData.insights.map((insight, index) => (
                      <li key={index} className="text-sm p-2 bg-yellow-50 dark:bg-gray-700 rounded">
                        {insight}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm p-2 bg-yellow-50 dark:bg-gray-700 rounded">
                      No insights were generated during this game.
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Player Stats Table */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-4">Player Statistics</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Player</th>
                      <th className="py-3 px-4 text-left">POS</th>
                      <th className="py-3 px-4 text-right">PTS</th>
                      <th className="py-3 px-4 text-right">REB</th>
                      <th className="py-3 px-4 text-right">AST</th>
                      <th className="py-3 px-4 text-right">STL</th>
                      <th className="py-3 px-4 text-right">BLK</th>
                      <th className="py-3 px-4 text-right">TO</th>
                      <th className="py-3 px-4 text-right">FG</th>
                      <th className="py-3 px-4 text-right">3PT</th>
                      <th className="py-3 px-4 text-right">FT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameData.players.map(player => {
                      const stats = gameData.playerStats[player.id]
                      if (!stats) return null
                      
                      // Calculate shooting percentages
                      const fgMade = stats['2PT_MADE'] + stats['3PT_MADE']
                      const fgAttempts = fgMade + stats['2PT_MISS'] + stats['3PT_MISS']
                      const fg = `${fgMade}/${fgAttempts}`
                      
                      const tpMade = stats['3PT_MADE']
                      const tpAttempts = tpMade + stats['3PT_MISS']
                      const tp = `${tpMade}/${tpAttempts}`
                      
                      const ftMade = stats['FT_MADE']
                      const ftAttempts = ftMade + stats['FT_MISS']
                      const ft = `${ftMade}/${ftAttempts}`
                      
                      return (
                        <tr 
                          key={player.id} 
                          className={`border-b dark:border-gray-700 ${selectedPlayer === player.id ? 'bg-primary-50 dark:bg-primary-900' : ''}`}
                          onClick={() => setSelectedPlayer(player.id)}
                        >
                          <td className="py-3 px-4 font-bold">
                            {player.name} <span className="text-gray-500 dark:text-gray-400">#{player.number}</span>
                          </td>
                          <td className="py-3 px-4">{player.position}</td>
                          <td className="py-3 px-4 text-right">{stats.PTS}</td>
                          <td className="py-3 px-4 text-right">{stats['REB_OFF'] + stats['REB_DEF']}</td>
                          <td className="py-3 px-4 text-right">{stats.AST}</td>
                          <td className="py-3 px-4 text-right">{stats.STL}</td>
                          <td className="py-3 px-4 text-right">{stats.BLK}</td>
                          <td className="py-3 px-4 text-right">{stats.TO}</td>
                          <td className="py-3 px-4 text-right">{fg}</td>
                          <td className="py-3 px-4 text-right">{tp}</td>
                          <td className="py-3 px-4 text-right">{ft}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* AI Recommendations */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900 dark:border-blue-800">
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Player Trends Tab */}
        {activeTab === 'player' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Player Performance Trends</h2>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Select Player
              </label>
              <select 
                className="input-field"
                value={selectedPlayer || ''}
                onChange={(e) => setSelectedPlayer(e.target.value || null)}
              >
                <option value="">Select a player</option>
                {/* Get unique players across all games */}
                {Array.from(new Set(games.flatMap(game => game.players)))
                  .filter((player, index, self) => 
                    index === self.findIndex(p => p.id === player.id)
                  )
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </option>
                  ))
                }
              </select>
            </div>
            
            {selectedPlayer && (
              <div>
                {/* Find player in any game */}
                {(() => {
                  const player = games.flatMap(game => game.players).find(p => p.id === selectedPlayer)
                  if (!player) return null
                  
                  const trends = getPlayerTrends(selectedPlayer)
                  
                  // If we don't have enough trend data
                  if (trends.scoring.length < 1) {
                    return (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Not enough game data available for this player
                      </div>
                    )
                  }
                  
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Scoring Trend */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-bold mb-2">Scoring Trend</h3>
                          <div className="h-40 flex items-end justify-between">
                            {trends.scoring.map((score, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="bg-primary-600 w-12 rounded-t"
                                  style={{ height: `${score / 40 * 100}%` }}
                                ></div>
                                <p className="text-xs mt-1">Game {trends.scoring.length - index}</p>
                                <p className="text-xs font-bold">{score} pts</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Efficiency Trend */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-bold mb-2">FG% Trend</h3>
                          <div className="h-40 flex items-end justify-between">
                            {trends.efficiency.map((eff, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="bg-green-600 w-12 rounded-t"
                                  style={{ height: `${eff}%` }}
                                ></div>
                                <p className="text-xs mt-1">Game {trends.efficiency.length - index}</p>
                                <p className="text-xs font-bold">{eff}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Defense Trend */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-bold mb-2">Defensive Stats Trend</h3>
                          <div className="h-40 flex items-end justify-between">
                            {trends.defense.map((def, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="bg-blue-600 w-12 rounded-t"
                                  style={{ height: `${def / 5 * 100}%` }}
                                ></div>
                                <p className="text-xs mt-1">Game {trends.defense.length - index}</p>
                                <p className="text-xs font-bold">{def} stl+blk</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* AI Analysis */}
                      <div className="p-4 bg-yellow-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-bold mb-2">AI Performance Analysis</h3>
                        <p className="text-sm mb-2">
                          {player.name} has shown {
                            trends.scoring.length > 1 && trends.scoring[0] > trends.scoring[trends.scoring.length - 1] ? 
                            'improving' : 'varying'
                          } scoring trends over the last {trends.scoring.length} games. 
                          Their shooting efficiency has been {
                            trends.efficiency.every(eff => eff > 50) ?
                            'consistently above 50%' : 'inconsistent'
                          }.
                        </p>
                        <p className="text-sm">
                          <strong>Recommendation:</strong> {
                            trends.scoring.length > 1 && trends.scoring[0] > trends.scoring[trends.scoring.length - 1] ?
                            'Continue with current offensive strategy as scoring is trending upward.' :
                            'Consider adjusting offensive sets to create better scoring opportunities.'
                          }
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
            
            {!selectedPlayer && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Select a player to view performance trends
              </div>
            )}
          </div>
        )}
        
        {/* Team Trends Tab */}
        {activeTab === 'team' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Team Performance Trends</h2>
            
            {teamTrends.scoring.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Scoring Trend */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Team Scoring Trend</h3>
                  <div className="h-40 flex items-end justify-between">
                    {teamTrends.scoring.map((score, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-primary-600 w-12 rounded-t"
                          style={{ height: `${score / 120 * 100}%` }}
                        ></div>
                        <p className="text-xs mt-1">Game {teamTrends.scoring.length - index}</p>
                        <p className="text-xs font-bold">{score} pts</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Defense Trend */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Points Allowed Trend</h3>
                  <div className="h-40 flex items-end justify-between">
                    {teamTrends.defense.map((score, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-red-600 w-12 rounded-t"
                          style={{ height: `${score / 120 * 100}%` }}
                        ></div>
                        <p className="text-xs mt-1">Game {teamTrends.defense.length - index}</p>
                        <p className="text-xs font-bold">{score} pts</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Assists Trend */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Team Assists Trend</h3>
                  <div className="h-40 flex items-end justify-between">
                    {teamTrends.assists.map((assists, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-green-600 w-12 rounded-t"
                          style={{ height: `${assists / 40 * 100}%` }}
                        ></div>
                        <p className="text-xs mt-1">Game {teamTrends.assists.length - index}</p>
                        <p className="text-xs font-bold">{assists} ast</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rebounds Trend */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Team Rebounds Trend</h3>
                  <div className="h-40 flex items-end justify-between">
                    {teamTrends.rebounds.map((rebounds, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-600 w-12 rounded-t"
                          style={{ height: `${rebounds / 50 * 100}%` }}
                        ></div>
                        <p className="text-xs mt-1">Game {teamTrends.rebounds.length - index}</p>
                        <p className="text-xs font-bold">{rebounds} reb</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Not enough game data available for team trends
              </div>
            )}
            
            {teamTrends.scoring.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-bold mb-2">AI Team Analysis</h3>
                <p className="text-sm mb-2">
                  The team has shown {
                    teamTrends.scoring[0] > teamTrends.scoring[teamTrends.scoring.length - 1] ? 
                    'improving offensive production' : 'varying offensive production'
                  } over the last {teamTrends.scoring.length} games, while defensive performance has been {
                    Math.abs(teamTrends.defense[0] - teamTrends.defense[teamTrends.defense.length - 1]) < 10 ?
                    'relatively consistent' : 'inconsistent'
                  }.
                </p>
                <p className="text-sm mb-2">
                  Ball movement metrics (assists) indicate {
                    teamTrends.assists.every(ast => ast > 20) ?
                    'excellent team chemistry and passing' : 'opportunities for improved ball movement'
                  }.
                </p>
                <p className="text-sm">
                  <strong>Key Recommendation:</strong> {
                    teamTrends.defense.some(def => def > 100) ?
                    'Focus on defensive rotations and communication to reduce points allowed.' :
                    'Maintain defensive intensity while looking for opportunities to increase scoring efficiency.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
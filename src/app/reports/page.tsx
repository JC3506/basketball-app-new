'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { useBasketballStore, Game, Player } from '@/lib/store'
import { format } from 'date-fns'

export default function Reports() {
  const games = useBasketballStore(state => state.games)
  const [reportType, setReportType] = useState<'player' | 'team'>('player')
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedGame, setSelectedGame] = useState<string>('')
  const [dateRange, setDateRange] = useState<'all' | 'last5' | 'last10'>('all')
  const [generatedReport, setGeneratedReport] = useState<boolean>(false)
  
  // Get all unique players across all games
  const allPlayers: Player[] = []
  const playerMap = new Map<string, Player>()
  
  games.forEach(game => {
    game.players.forEach(player => {
      if (!playerMap.has(player.id)) {
        playerMap.set(player.id, player)
        allPlayers.push(player)
      }
    })
  })
  
  const handleGenerateReport = () => {
    setGeneratedReport(true)
  }
  
  const renderPlayerReport = () => {
    if (!selectedPlayer) return null
    
    const player = allPlayers.find(p => p.id === selectedPlayer)
    if (!player) return null
    
    // Filter games based on selection
    let relevantGames = games.filter(game => 
      game.players.some(p => p.id === player.id)
    )
    
    if (selectedGame) {
      relevantGames = relevantGames.filter(game => game.id === selectedGame)
    }
    
    // Sort games by date (newest first)
    relevantGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Apply date range filter
    if (dateRange === 'last5') {
      relevantGames = relevantGames.slice(0, 5)
    } else if (dateRange === 'last10') {
      relevantGames = relevantGames.slice(0, 10)
    }
    
    // Calculate aggregate stats
    let totalPTS = 0
    let totalREB = 0
    let totalAST = 0
    let totalSTL = 0
    let totalBLK = 0
    let totalTO = 0
    let totalFGM = 0
    let totalFGA = 0
    let totalTPM = 0
    let totalTPA = 0
    let totalFTM = 0
    let totalFTA = 0
    
    relevantGames.forEach(game => {
      const stats = game.playerStats[player.id]
      if (!stats) return
      
      totalPTS += stats.PTS
      totalREB += stats['REB_OFF'] + stats['REB_DEF']
      totalAST += stats.AST
      totalSTL += stats.STL
      totalBLK += stats.BLK
      totalTO += stats.TO
      
      totalFGM += stats['2PT_MADE'] + stats['3PT_MADE']
      totalFGA += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
      
      totalTPM += stats['3PT_MADE']
      totalTPA += stats['3PT_MADE'] + stats['3PT_MISS']
      
      totalFTM += stats['FT_MADE']
      totalFTA += stats['FT_MADE'] + stats['FT_MISS']
    })
    
    const gamesPlayed = relevantGames.length
    const avgPTS = gamesPlayed > 0 ? totalPTS / gamesPlayed : 0
    const avgREB = gamesPlayed > 0 ? totalREB / gamesPlayed : 0
    const avgAST = gamesPlayed > 0 ? totalAST / gamesPlayed : 0
    const avgSTL = gamesPlayed > 0 ? totalSTL / gamesPlayed : 0
    const avgBLK = gamesPlayed > 0 ? totalBLK / gamesPlayed : 0
    const avgTO = gamesPlayed > 0 ? totalTO / gamesPlayed : 0
    
    const fgPct = totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0
    const tpPct = totalTPA > 0 ? (totalTPM / totalTPA) * 100 : 0
    const ftPct = totalFTA > 0 ? (totalFTM / totalFTA) * 100 : 0
    
    // Calculate efficiency rating
    const totalEFF = totalPTS + totalREB + totalAST + totalSTL + totalBLK - totalTO - (totalFGA - totalFGM) - (totalFTA - totalFTM)
    const avgEFF = gamesPlayed > 0 ? totalEFF / gamesPlayed : 0
    
    // Generate insights
    const insights = []
    
    if (avgPTS > 20) {
      insights.push(`${player.name} is a primary scoring option, averaging ${avgPTS.toFixed(1)} points per game.`)
    } else if (avgPTS > 15) {
      insights.push(`${player.name} is a reliable scorer, contributing ${avgPTS.toFixed(1)} points per game.`)
    }
    
    if (avgREB > 10) {
      insights.push(`${player.name} is an elite rebounder with ${avgREB.toFixed(1)} rebounds per game.`)
    } else if (avgREB > 7) {
      insights.push(`${player.name} is a strong rebounder, averaging ${avgREB.toFixed(1)} boards per game.`)
    }
    
    if (avgAST > 7) {
      insights.push(`${player.name} is an excellent playmaker with ${avgAST.toFixed(1)} assists per game.`)
    } else if (avgAST > 4) {
      insights.push(`${player.name} shows good playmaking ability with ${avgAST.toFixed(1)} assists per game.`)
    }
    
    if (avgSTL + avgBLK > 3) {
      insights.push(`${player.name} is a defensive presence, averaging ${(avgSTL + avgBLK).toFixed(1)} combined steals and blocks.`)
    }
    
    if (tpPct > 40 && totalTPA >= gamesPlayed * 3) {
      insights.push(`${player.name} is an excellent three-point shooter at ${tpPct.toFixed(1)}%.`)
    } else if (tpPct < 30 && totalTPA >= gamesPlayed * 3) {
      insights.push(`${player.name} is struggling from three-point range, shooting only ${tpPct.toFixed(1)}%.`)
    }
    
    if (avgTO > 3) {
      insights.push(`${player.name} needs to improve ball security, averaging ${avgTO.toFixed(1)} turnovers per game.`)
    }
    
    if (insights.length === 0) {
      insights.push(`${player.name} has shown balanced performance across statistical categories.`)
    }
    
    return (
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary-700 text-white p-6">
            <h2 className="text-2xl font-bold">Player Report: {player.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <p>Position: {player.position}</p>
              <p>Jersey: #{player.number}</p>
              <p>Games Analyzed: {gamesPlayed}</p>
              <p>Report Date: {format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Points Per Game</p>
                <p className="text-2xl font-bold">{avgPTS.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rebounds Per Game</p>
                <p className="text-2xl font-bold">{avgREB.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Assists Per Game</p>
                <p className="text-2xl font-bold">{avgAST.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Efficiency Rating</p>
                <p className="text-2xl font-bold">{avgEFF.toFixed(1)}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Shooting Percentages</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Field Goal: {fgPct.toFixed(1)}%</span>
                    <span>{totalFGM}/{totalFGA}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(fgPct, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Three Point: {tpPct.toFixed(1)}%</span>
                    <span>{totalTPM}/{totalTPA}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(tpPct, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Free Throw: {ftPct.toFixed(1)}%</span>
                    <span>{totalFTM}/{totalFTA}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(ftPct, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Performance Insights</h3>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <p key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Game-by-Game Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Game</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-right">PTS</th>
                      <th className="py-3 px-4 text-right">REB</th>
                      <th className="py-3 px-4 text-right">AST</th>
                      <th className="py-3 px-4 text-right">STL</th>
                      <th className="py-3 px-4 text-right">BLK</th>
                      <th className="py-3 px-4 text-right">TO</th>
                      <th className="py-3 px-4 text-right">EFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantGames.map(game => {
                      const stats = game.playerStats[player.id]
                      if (!stats) return null
                      
                      const reb = stats['REB_OFF'] + stats['REB_DEF']
                      const fgm = stats['2PT_MADE'] + stats['3PT_MADE']
                      const fga = fgm + stats['2PT_MISS'] + stats['3PT_MISS']
                      const ftm = stats['FT_MADE']
                      const fta = ftm + stats['FT_MISS']
                      
                      const eff = stats.PTS + reb + stats.AST + stats.STL + stats.BLK - stats.TO - (fga - fgm) - (fta - ftm)
                      
                      return (
                        <tr key={game.id} className="border-b dark:border-gray-700">
                          <td className="py-3 px-4">{game.name}</td>
                          <td className="py-3 px-4">{format(new Date(game.date), 'MM/dd/yyyy')}</td>
                          <td className="py-3 px-4 text-right">{stats.PTS}</td>
                          <td className="py-3 px-4 text-right">{reb}</td>
                          <td className="py-3 px-4 text-right">{stats.AST}</td>
                          <td className="py-3 px-4 text-right">{stats.STL}</td>
                          <td className="py-3 px-4 text-right">{stats.BLK}</td>
                          <td className="py-3 px-4 text-right">{stats.TO}</td>
                          <td className="py-3 px-4 text-right">{eff}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => window.print()}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const renderTeamReport = () => {
    // Filter games based on selection
    let relevantGames = [...games]
    
    if (selectedGame) {
      relevantGames = relevantGames.filter(game => game.id === selectedGame)
    }
    
    // Sort games by date (newest first)
    relevantGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Apply date range filter
    if (dateRange === 'last5') {
      relevantGames = relevantGames.slice(0, 5)
    } else if (dateRange === 'last10') {
      relevantGames = relevantGames.slice(0, 10)
    }
    
    if (relevantGames.length === 0) {
      return (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <p className="text-center text-gray-500 dark:text-gray-400">No games available for the selected criteria.</p>
        </div>
      )
    }
    
    // Calculate team stats
    let totalPTS = 0
    let totalOPP_PTS = 0
    let totalFGM = 0
    let totalFGA = 0
    let totalTPM = 0
    let totalTPA = 0
    let totalFTM = 0
    let totalFTA = 0
    let totalREB = 0
    let totalAST = 0
    let totalSTL = 0
    let totalBLK = 0
    let totalTO = 0
    
    let wins = 0
    let losses = 0
    
    relevantGames.forEach(game => {
      totalPTS += game.score.team
      totalOPP_PTS += game.score.opponent
      
      if (game.score.team > game.score.opponent) {
        wins++
      } else {
        losses++
      }
      
      // Calculate other stats from player stats
      Object.values(game.playerStats).forEach(stats => {
        totalFGM += stats['2PT_MADE'] + stats['3PT_MADE']
        totalFGA += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
        totalTPM += stats['3PT_MADE']
        totalTPA += stats['3PT_MADE'] + stats['3PT_MISS']
        totalFTM += stats['FT_MADE']
        totalFTA += stats['FT_MADE'] + stats['FT_MISS']
        totalREB += stats['REB_OFF'] + stats['REB_DEF']
        totalAST += stats.AST
        totalSTL += stats.STL
        totalBLK += stats.BLK
        totalTO += stats.TO
      })
    })
    
    const gamesPlayed = relevantGames.length
    const avgPTS = gamesPlayed > 0 ? totalPTS / gamesPlayed : 0
    const avgOPP_PTS = gamesPlayed > 0 ? totalOPP_PTS / gamesPlayed : 0
    const avgREB = gamesPlayed > 0 ? totalREB / gamesPlayed : 0
    const avgAST = gamesPlayed > 0 ? totalAST / gamesPlayed : 0
    const avgSTL = gamesPlayed > 0 ? totalSTL / gamesPlayed : 0
    const avgBLK = gamesPlayed > 0 ? totalBLK / gamesPlayed : 0
    const avgTO = gamesPlayed > 0 ? totalTO / gamesPlayed : 0
    
    const fgPct = totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0
    const tpPct = totalTPA > 0 ? (totalTPM / totalTPA) * 100 : 0
    const ftPct = totalFTA > 0 ? (totalFTM / totalFTA) * 100 : 0
    
    // Generate insights
    const insights = []
    
    if (wins > losses) {
      insights.push(`The team has a winning record of ${wins}-${losses} (${(wins/gamesPlayed*100).toFixed(1)}%).`)
    } else if (losses > wins) {
      insights.push(`The team has a losing record of ${wins}-${losses} (${(wins/gamesPlayed*100).toFixed(1)}%).`)
    } else {
      insights.push(`The team has an even record of ${wins}-${losses}.`)
    }
    
    if (avgPTS > avgOPP_PTS + 5) {
      insights.push(`The team is dominating offensively, outscoring opponents by ${(avgPTS - avgOPP_PTS).toFixed(1)} points per game.`)
    } else if (avgOPP_PTS > avgPTS + 5) {
      insights.push(`The team is struggling defensively, being outscored by ${(avgOPP_PTS - avgPTS).toFixed(1)} points per game.`)
    }
    
    if (fgPct > 47) {
      insights.push(`The team has excellent shooting efficiency at ${fgPct.toFixed(1)}% from the field.`)
    } else if (fgPct < 40) {
      insights.push(`The team needs to improve shooting efficiency, currently at ${fgPct.toFixed(1)}% from the field.`)
    }
    
    if (tpPct > 37) {
      insights.push(`The team is shooting well from three-point range at ${tpPct.toFixed(1)}%.`)
    } else if (tpPct < 30) {
      insights.push(`The team is struggling from three-point range, shooting only ${tpPct.toFixed(1)}%.`)
    }
    
    if (avgAST > 25) {
      insights.push(`The team shows excellent ball movement, averaging ${avgAST.toFixed(1)} assists per game.`)
    }
    
    if (avgTO < 10) {
      insights.push(`The team takes good care of the ball, averaging only ${avgTO.toFixed(1)} turnovers per game.`)
    } else if (avgTO > 15) {
      insights.push(`The team needs to improve ball security, averaging ${avgTO.toFixed(1)} turnovers per game.`)
    }
    
    // Calculate top performers
    const playerPerformances = new Map<string, { 
      player: Player, 
      gamesPlayed: number,
      totalPTS: number,
      totalREB: number,
      totalAST: number
    }>()
    
    relevantGames.forEach(game => {
      game.players.forEach(player => {
        const stats = game.playerStats[player.id]
        if (!stats) return
        
        if (!playerPerformances.has(player.id)) {
          playerPerformances.set(player.id, {
            player,
            gamesPlayed: 1,
            totalPTS: stats.PTS,
            totalREB: stats['REB_OFF'] + stats['REB_DEF'],
            totalAST: stats.AST
          })
        } else {
          const perf = playerPerformances.get(player.id)!
          playerPerformances.set(player.id, {
            ...perf,
            gamesPlayed: perf.gamesPlayed + 1,
            totalPTS: perf.totalPTS + stats.PTS,
            totalREB: perf.totalREB + stats['REB_OFF'] + stats['REB_DEF'],
            totalAST: perf.totalAST + stats.AST
          })
        }
      })
    })
    
    const topScorers = Array.from(playerPerformances.values())
      .filter(perf => perf.gamesPlayed >= gamesPlayed * 0.5) // Played at least half the games
      .sort((a, b) => (b.totalPTS / b.gamesPlayed) - (a.totalPTS / a.gamesPlayed))
      .slice(0, 3)
    
    const topRebounders = Array.from(playerPerformances.values())
      .filter(perf => perf.gamesPlayed >= gamesPlayed * 0.5)
      .sort((a, b) => (b.totalREB / b.gamesPlayed) - (a.totalREB / a.gamesPlayed))
      .slice(0, 3)
    
    const topPlaymakers = Array.from(playerPerformances.values())
      .filter(perf => perf.gamesPlayed >= gamesPlayed * 0.5)
      .sort((a, b) => (b.totalAST / b.gamesPlayed) - (a.totalAST / a.gamesPlayed))
      .slice(0, 3)
    
    return (
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary-700 text-white p-6">
            <h2 className="text-2xl font-bold">Team Report: {relevantGames[0].team}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <p>Games Analyzed: {gamesPlayed}</p>
              <p>Record: {wins}-{losses}</p>
              <p>Report Date: {format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Points Per Game</p>
                <p className="text-2xl font-bold">{avgPTS.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Opponent PPG</p>
                <p className="text-2xl font-bold">{avgOPP_PTS.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Point Differential</p>
                <p className={`text-2xl font-bold ${avgPTS >= avgOPP_PTS ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPTS > avgOPP_PTS ? '+' : ''}{(avgPTS - avgOPP_PTS).toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Win Percentage</p>
                <p className="text-2xl font-bold">{(wins/gamesPlayed*100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Team Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Shooting Percentages</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Field Goal: {fgPct.toFixed(1)}%</span>
                        <span>{totalFGM}/{totalFGA}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(fgPct, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Three Point: {tpPct.toFixed(1)}%</span>
                        <span>{totalTPM}/{totalTPA}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(tpPct, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Free Throw: {ftPct.toFixed(1)}%</span>
                        <span>{totalFTM}/{totalFTA}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(ftPct, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Other Statistics (Per Game)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rebounds</p>
                      <p className="text-xl font-bold">{avgREB.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assists</p>
                      <p className="text-xl font-bold">{avgAST.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Steals + Blocks</p>
                      <p className="text-xl font-bold">{(avgSTL + avgBLK).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Turnovers</p>
                      <p className="text-xl font-bold">{avgTO.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Performance Insights</h3>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <p key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Top Scorers</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {topScorers.map((perf, index) => (
                      <li key={index}>
                        <span className="font-medium">{perf.player.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {(perf.totalPTS / perf.gamesPlayed).toFixed(1)} PPG
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Top Rebounders</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {topRebounders.map((perf, index) => (
                      <li key={index}>
                        <span className="font-medium">{perf.player.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {(perf.totalREB / perf.gamesPlayed).toFixed(1)} RPG
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Top Playmakers</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {topPlaymakers.map((perf, index) => (
                      <li key={index}>
                        <span className="font-medium">{perf.player.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {(perf.totalAST / perf.gamesPlayed).toFixed(1)} APG
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Game Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Game</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Opponent</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantGames.map(game => (
                      <tr key={game.id} className="border-b dark:border-gray-700">
                        <td className="py-3 px-4">{game.name}</td>
                        <td className="py-3 px-4">{format(new Date(game.date), 'MM/dd/yyyy')}</td>
                        <td className="py-3 px-4">{game.opponent}</td>
                        <td className="py-3 px-4 text-right">{game.score.team} - {game.score.opponent}</td>
                        <td className={`py-3 px-4 text-right font-bold ${game.score.team > game.score.opponent ? 'text-green-600' : 'text-red-600'}`}>
                          {game.score.team > game.score.opponent ? 'W' : 'L'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => window.print()}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title="Reports" />
      
      <main className="container mx-auto py-8 px-4">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Generate Reports</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Report Type
              </label>
              <div className="flex space-x-4">
                <button 
                  className={`py-2 px-4 rounded ${reportType === 'player' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setReportType('player')}
                >
                  Player Report
                </button>
                <button 
                  className={`py-2 px-4 rounded ${reportType === 'team' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setReportType('team')}
                >
                  Team Report
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Date Range
              </label>
              <div className="flex space-x-4">
                <button 
                  className={`py-2 px-4 rounded ${dateRange === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setDateRange('all')}
                >
                  All Games
                </button>
                <button 
                  className={`py-2 px-4 rounded ${dateRange === 'last5' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setDateRange('last5')}
                >
                  Last 5 Games
                </button>
                <button 
                  className={`py-2 px-4 rounded ${dateRange === 'last10' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setDateRange('last10')}
                >
                  Last 10 Games
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {reportType === 'player' && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="playerSelect">
                  Select Player
                </label>
                <select 
                  id="playerSelect"
                  className="input-field"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                >
                  <option value="">Select a player</option>
                  {allPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="gameSelect">
                Specific Game (Optional)
              </label>
              <select 
                id="gameSelect"
                className="input-field"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">All Games</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name} - {format(new Date(game.date), 'MM/dd/yyyy')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleGenerateReport}
              disabled={(reportType === 'player' && !selectedPlayer) || games.length === 0}
            >
              Generate Report
            </button>
          </div>
        </div>
        
        {generatedReport && (
          reportType === 'player' ? renderPlayerReport() : renderTeamReport()
        )}
      </main>
    </div>
  )
}
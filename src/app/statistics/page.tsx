'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { useBasketballStore, Game, Player, PlayerStats } from '@/lib/store'
import { format } from 'date-fns'

export default function Statistics() {
  const games = useBasketballStore(state => state.games)
  const [selectedGame, setSelectedGame] = useState<string | 'all'>('all')
  const [statCategory, setStatCategory] = useState<'offense' | 'defense' | 'efficiency'>('offense')
  
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
  
  // Calculate aggregate stats for each player
  const playerStats = allPlayers.map(player => {
    const relevantGames = selectedGame === 'all' 
      ? games 
      : games.filter(game => game.id === selectedGame)
    
    const gamesPlayed = relevantGames.filter(game => 
      game.players.some(p => p.id === player.id)
    ).length
    
    if (gamesPlayed === 0) {
      return {
        player,
        gamesPlayed: 0,
        stats: {
          PTS: 0,
          REB: 0,
          AST: 0,
          STL: 0,
          BLK: 0,
          TO: 0,
          FGM: 0,
          FGA: 0,
          FG_PCT: 0,
          TPM: 0,
          TPA: 0,
          TP_PCT: 0,
          FTM: 0,
          FTA: 0,
          FT_PCT: 0,
          EFF: 0
        }
      }
    }
    
    // Aggregate stats
    let totalPTS = 0
    let totalREB_OFF = 0
    let totalREB_DEF = 0
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
      totalREB_OFF += stats['REB_OFF']
      totalREB_DEF += stats['REB_DEF']
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
    
    const totalREB = totalREB_OFF + totalREB_DEF
    const FG_PCT = totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0
    const TP_PCT = totalTPA > 0 ? (totalTPM / totalTPA) * 100 : 0
    const FT_PCT = totalFTA > 0 ? (totalFTM / totalFTA) * 100 : 0
    
    // Calculate efficiency rating
    const EFF = totalPTS + totalREB + totalAST + totalSTL + totalBLK - totalTO - (totalFGA - totalFGM) - (totalFTA - totalFTM)
    
    return {
      player,
      gamesPlayed,
      stats: {
        PTS: totalPTS / gamesPlayed,
        REB: totalREB / gamesPlayed,
        AST: totalAST / gamesPlayed,
        STL: totalSTL / gamesPlayed,
        BLK: totalBLK / gamesPlayed,
        TO: totalTO / gamesPlayed,
        FGM: totalFGM / gamesPlayed,
        FGA: totalFGA / gamesPlayed,
        FG_PCT,
        TPM: totalTPM / gamesPlayed,
        TPA: totalTPA / gamesPlayed,
        TP_PCT,
        FTM: totalFTM / gamesPlayed,
        FTA: totalFTA / gamesPlayed,
        FT_PCT,
        EFF: EFF / gamesPlayed
      }
    }
  }).filter(playerStat => playerStat.gamesPlayed > 0)
  
  // Sort players based on selected stat category
  const getSortValue = (stat: typeof playerStats[0]) => {
    switch (statCategory) {
      case 'offense':
        return stat.stats.PTS
      case 'defense':
        return stat.stats.REB + stat.stats.STL + stat.stats.BLK
      case 'efficiency':
        return stat.stats.EFF
      default:
        return stat.stats.PTS
    }
  }
  
  const sortedPlayerStats = [...playerStats].sort((a, b) => getSortValue(b) - getSortValue(a))
  
  // Calculate team averages
  const calculateTeamAverages = () => {
    const relevantGames = selectedGame === 'all' 
      ? games 
      : games.filter(game => game.id === selectedGame)
    
    if (relevantGames.length === 0) {
      return {
        PTS: 0,
        OPP_PTS: 0,
        DIFF: 0,
        FG_PCT: 0,
        TP_PCT: 0,
        REB: 0,
        AST: 0,
        STL: 0,
        BLK: 0,
        TO: 0
      }
    }
    
    let totalPTS = 0
    let totalOPP_PTS = 0
    let totalFGM = 0
    let totalFGA = 0
    let totalTPM = 0
    let totalTPA = 0
    let totalREB = 0
    let totalAST = 0
    let totalSTL = 0
    let totalBLK = 0
    let totalTO = 0
    
    relevantGames.forEach(game => {
      totalPTS += game.score.team
      totalOPP_PTS += game.score.opponent
      
      // Calculate other stats from player stats
      Object.values(game.playerStats).forEach(stats => {
        totalFGM += stats['2PT_MADE'] + stats['3PT_MADE']
        totalFGA += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS']
        totalTPM += stats['3PT_MADE']
        totalTPA += stats['3PT_MADE'] + stats['3PT_MISS']
        totalREB += stats['REB_OFF'] + stats['REB_DEF']
        totalAST += stats.AST
        totalSTL += stats.STL
        totalBLK += stats.BLK
        totalTO += stats.TO
      })
    })
    
    return {
      PTS: totalPTS / relevantGames.length,
      OPP_PTS: totalOPP_PTS / relevantGames.length,
      DIFF: (totalPTS - totalOPP_PTS) / relevantGames.length,
      FG_PCT: totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0,
      TP_PCT: totalTPA > 0 ? (totalTPM / totalTPA) * 100 : 0,
      REB: totalREB / relevantGames.length,
      AST: totalAST / relevantGames.length,
      STL: totalSTL / relevantGames.length,
      BLK: totalBLK / relevantGames.length,
      TO: totalTO / relevantGames.length
    }
  }
  
  const teamAverages = calculateTeamAverages()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title="Statistics" />
      
      <main className="container mx-auto py-8 px-4">
        <div className="card mb-6">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Team Statistics</h1>
            
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <select 
                className="input-field py-1 px-2 text-sm"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="all">All Games</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name} - {format(new Date(game.date), 'MM/dd/yyyy')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Points Per Game</p>
              <p className="text-2xl font-bold">{teamAverages.PTS.toFixed(1)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Opponent PPG</p>
              <p className="text-2xl font-bold">{teamAverages.OPP_PTS.toFixed(1)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Point Differential</p>
              <p className={`text-2xl font-bold ${teamAverages.DIFF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {teamAverages.DIFF > 0 ? '+' : ''}{teamAverages.DIFF.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">FG%</p>
              <p className="text-2xl font-bold">{teamAverages.FG_PCT.toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">3PT%</p>
              <p className="text-2xl font-bold">{teamAverages.TP_PCT.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Rebounds</p>
              <p className="text-2xl font-bold">{teamAverages.REB.toFixed(1)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Assists</p>
              <p className="text-2xl font-bold">{teamAverages.AST.toFixed(1)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Steals + Blocks</p>
              <p className="text-2xl font-bold">{(teamAverages.STL + teamAverages.BLK).toFixed(1)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Turnovers</p>
              <p className="text-2xl font-bold">{teamAverages.TO.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Player Statistics</h2>
            
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button 
                className={`py-1 px-3 rounded text-sm ${statCategory === 'offense' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setStatCategory('offense')}
              >
                Offense
              </button>
              <button 
                className={`py-1 px-3 rounded text-sm ${statCategory === 'defense' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setStatCategory('defense')}
              >
                Defense
              </button>
              <button 
                className={`py-1 px-3 rounded text-sm ${statCategory === 'efficiency' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setStatCategory('efficiency')}
              >
                Efficiency
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-right">GP</th>
                  {statCategory === 'offense' && (
                    <>
                      <th className="py-3 px-4 text-right">PTS</th>
                      <th className="py-3 px-4 text-right">FG%</th>
                      <th className="py-3 px-4 text-right">3P%</th>
                      <th className="py-3 px-4 text-right">FT%</th>
                      <th className="py-3 px-4 text-right">AST</th>
                    </>
                  )}
                  {statCategory === 'defense' && (
                    <>
                      <th className="py-3 px-4 text-right">REB</th>
                      <th className="py-3 px-4 text-right">STL</th>
                      <th className="py-3 px-4 text-right">BLK</th>
                      <th className="py-3 px-4 text-right">TO</th>
                    </>
                  )}
                  {statCategory === 'efficiency' && (
                    <>
                      <th className="py-3 px-4 text-right">EFF</th>
                      <th className="py-3 px-4 text-right">PTS</th>
                      <th className="py-3 px-4 text-right">REB</th>
                      <th className="py-3 px-4 text-right">AST</th>
                      <th className="py-3 px-4 text-right">STL+BLK</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedPlayerStats.map((playerStat, index) => (
                  <tr key={playerStat.player.id} className="border-b dark:border-gray-700">
                    <td className="py-3 px-4 font-bold">
                      {playerStat.player.name} <span className="text-gray-500 dark:text-gray-400">#{playerStat.player.number}</span>
                    </td>
                    <td className="py-3 px-4 text-right">{playerStat.gamesPlayed}</td>
                    {statCategory === 'offense' && (
                      <>
                        <td className="py-3 px-4 text-right">{playerStat.stats.PTS.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.FG_PCT.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.TP_PCT.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.FT_PCT.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.AST.toFixed(1)}</td>
                      </>
                    )}
                    {statCategory === 'defense' && (
                      <>
                        <td className="py-3 px-4 text-right">{playerStat.stats.REB.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.STL.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.BLK.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.TO.toFixed(1)}</td>
                      </>
                    )}
                    {statCategory === 'efficiency' && (
                      <>
                        <td className="py-3 px-4 text-right">{playerStat.stats.EFF.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.PTS.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.REB.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{playerStat.stats.AST.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{(playerStat.stats.STL + playerStat.stats.BLK).toFixed(1)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
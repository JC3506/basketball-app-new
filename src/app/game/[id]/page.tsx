'use client'

import { useEffect, useState } from 'react'
import { useBasketballStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EnhancedShotChart from '@/components/EnhancedShotChart'
import ShotInput from '@/components/ShotInput'
import EnhancedShotInputWithDefender from './EnhancedShotInputWithDefender'
import EnhancedAIInsights from '@/components/EnhancedAIInsights'
import EnhancedDefensiveAIInsights from './EnhancedDefensiveAIInsights'
import DefensiveImpactChart from './DefensiveImpactChart'

export default function GamePage({ params }: { params: { id: string } }) {
  const gameId = params.id
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'shots' | 'defense' | 'insights'>('stats')
  
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  const updateGameStatus = useBasketballStore(state => state.updateGameStatus)
  const updateGameQuarter = useBasketballStore(state => state.updateGameQuarter)
  const updateGameTime = useBasketballStore(state => state.updateGameTime)
  const updateGameScore = useBasketballStore(state => state.updateGameScore)
  const togglePlayerActive = useBasketballStore(state => state.togglePlayerActive)
  const recordStat = useBasketballStore(state => state.recordStat)
  
  useEffect(() => {
    if (!game) {
      router.push('/')
    }
  }, [game, router])
  
  if (!game) {
    return <div>Loading...</div>
  }
  
  const handleEndGame = () => {
    updateGameStatus(gameId, 'completed')
    router.push('/')
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <div className="space-y-6">
            {/* Player Stats */}
            <div className="card">
              <h2 className="card-header">Player Statistics</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Player</th>
                      <th className="table-header-cell">PTS</th>
                      <th className="table-header-cell">2PT</th>
                      <th className="table-header-cell">3PT</th>
                      <th className="table-header-cell">FT</th>
                      <th className="table-header-cell">REB</th>
                      <th className="table-header-cell">AST</th>
                      <th className="table-header-cell">STL</th>
                      <th className="table-header-cell">BLK</th>
                      <th className="table-header-cell">TO</th>
                      <th className="table-header-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.players.map(player => {
                      const stats = game.playerStats[player.id]
                      return (
                        <tr key={player.id} className="table-row">
                          <td className="table-cell font-medium">
                            {player.name} <span className="text-gray-500">#{player.number}</span>
                          </td>
                          <td className="table-cell">{stats.PTS}</td>
                          <td className="table-cell">
                            {stats['2PT_MADE']}/{stats['2PT_MADE'] + stats['2PT_MISS']}
                          </td>
                          <td className="table-cell">
                            {stats['3PT_MADE']}/{stats['3PT_MADE'] + stats['3PT_MISS']}
                          </td>
                          <td className="table-cell">
                            {stats['FT_MADE']}/{stats['FT_MADE'] + stats['FT_MISS']}
                          </td>
                          <td className="table-cell">
                            {stats['REB_OFF'] + stats['REB_DEF']}
                          </td>
                          <td className="table-cell">{stats.AST}</td>
                          <td className="table-cell">{stats.STL}</td>
                          <td className="table-cell">{stats.BLK}</td>
                          <td className="table-cell">{stats.TO}</td>
                          <td className="table-cell">
                            <button
                              className={`px-2 py-1 rounded text-xs ${
                                player.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                              onClick={() => togglePlayerActive(gameId, player.id)}
                            >
                              {player.isActive ? 'Active' : 'Bench'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Stat Recording */}
            <div className="card">
              <h2 className="card-header">Record Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Select Player</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.players
                      .filter(player => player.isActive)
                      .map(player => (
                        <button
                          key={player.id}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                          onClick={() => {}}
                        >
                          {player.name} #{player.number}
                        </button>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">Record Action</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Stat buttons would go here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'shots':
        return (
          <div className="space-y-6">
            <EnhancedShotChart gameId={gameId} />
            <EnhancedShotInputWithDefender gameId={gameId} />
          </div>
        )
      
      case 'defense':
        return (
          <div className="space-y-6">
            <DefensiveImpactChart gameId={gameId} />
            <div className="card">
              <h2 className="card-header">Defensive Matchup Analysis</h2>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">Defender Efficiency</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Defender</th>
                          <th className="table-header-cell">Contests</th>
                          <th className="table-header-cell">Successful</th>
                          <th className="table-header-cell">Efficiency</th>
                          <th className="table-header-cell">Avg Distance</th>
                          <th className="table-header-cell">Best Zone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {game.players.map(player => {
                          // In a real implementation, this would use actual defender data
                          // For now, we'll use placeholder data
                          return (
                            <tr key={player.id} className="table-row">
                              <td className="table-cell font-medium">
                                {player.name} <span className="text-gray-500">#{player.number}</span>
                              </td>
                              <td className="table-cell">12</td>
                              <td className="table-cell">8</td>
                              <td className="table-cell">66.7%</td>
                              <td className="table-cell">4.2 ft</td>
                              <td className="table-cell">Paint</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-2">Zone Defense Efficiency</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Paint', 'Mid-Range Left', 'Mid-Range Right', 'Left Corner 3', 'Right Corner 3', 'Above Break 3'].map(zone => (
                      <div key={zone} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h4 className="font-medium text-sm">{zone}</h4>
                        <div className="mt-2 flex justify-between text-sm">
                          <span>Contests: 8</span>
                          <span>Efficiency: 62.5%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'insights':
        return (
          <div className="space-y-6">
            <EnhancedDefensiveAIInsights gameId={gameId} />
          </div>
        )
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(game.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-3xl font-bold mb-2">
                {game.team} {game.score.team} - {game.score.opponent} {game.opponent}
              </div>
              <div className="flex space-x-4 items-center">
                <div className="text-gray-600 dark:text-gray-400">
                  Q{game.quarter} | {game.timeRemaining}
                </div>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={handleEndGame}
                >
                  End Game
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`tab-button ${activeTab === 'stats' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button
            className={`tab-button ${activeTab === 'shots' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('shots')}
          >
            Shot Chart
          </button>
          <button
            className={`tab-button ${activeTab === 'defense' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('defense')}
          >
            Defense
          </button>
          <button
            className={`tab-button ${activeTab === 'insights' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('insights')}
          >
            AI Insights
          </button>
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  )
}
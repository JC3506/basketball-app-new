'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

// Components
import Navbar from '@/components/Navbar'
import PlayerCard from '@/components/PlayerCard'
import StatEntryPanel from '@/components/StatEntryPanel'
import GameClock from '@/components/GameClock'
import Scoreboard from '@/components/Scoreboard'
import AIInsights from '@/components/AIInsights'

// Store
import { useBasketballStore, Player, PlayerStats, initPlayerStats } from '@/lib/store'

export default function GameInProgress() {
  const router = useRouter()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [gameTime, setGameTime] = useState({ isRunning: false, timeRemaining: '12:00' })
  
  // Get current game from store
  const currentGame = useBasketballStore(state => state.currentGame)
  const games = useBasketballStore(state => state.games)
  const updateGameTime = useBasketballStore(state => state.updateGameTime)
  const updateGameQuarter = useBasketballStore(state => state.updateGameQuarter)
  const updateGameScore = useBasketballStore(state => state.updateGameScore)
  const togglePlayerActive = useBasketballStore(state => state.togglePlayerActive)
  const recordStat = useBasketballStore(state => state.recordStat)
  
  // If no current game, use the most recent game or redirect to new game
  useEffect(() => {
    if (!currentGame && games.length > 0) {
      // Use the most recent game
      const mostRecentGame = games[games.length - 1]
      if (mostRecentGame.status === 'in-progress') {
        // Set game time from the stored game
        setGameTime({
          isRunning: false,
          timeRemaining: mostRecentGame.timeRemaining
        })
      } else {
        // If the most recent game is completed, redirect to new game
        router.push('/new-game')
      }
    } else if (!currentGame && games.length === 0) {
      // No games exist, redirect to new game
      router.push('/new-game')
    } else if (currentGame) {
      // Set game time from the current game
      setGameTime({
        isRunning: false,
        timeRemaining: currentGame.timeRemaining
      })
    }
  }, [currentGame, games, router])
  
  // If no game is available, show loading
  if (!currentGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading game data...</p>
      </div>
    )
  }
  
  // Toggle game clock
  const toggleGameClock = () => {
    setGameTime(prev => ({ ...prev, isRunning: !prev.isRunning }))
  }
  
  // Change quarter
  const changeQuarter = (increment: number) => {
    const newQuarter = Math.max(1, Math.min(4, currentGame.quarter + increment))
    updateGameQuarter(currentGame.id, newQuarter)
    updateGameTime(currentGame.id, '12:00')
    setGameTime(prev => ({ ...prev, isRunning: false, timeRemaining: '12:00' }))
  }
  
  // Update time
  const handleUpdateTime = (time: string) => {
    updateGameTime(currentGame.id, time)
    setGameTime(prev => ({ ...prev, timeRemaining: time }))
  }
  
  // Handle score update
  const handleUpdateScore = (team: 'team' | 'opponent', points: number) => {
    updateGameScore(currentGame.id, team, points)
  }
  
  // Handle player toggle active
  const handleTogglePlayerActive = (playerId: string) => {
    togglePlayerActive(currentGame.id, playerId)
  }
  
  // Handle stat recording
  const handleRecordStat = (playerId: string, statType: keyof PlayerStats) => {
    recordStat(currentGame.id, playerId, statType)
  }
  
  // Get active and bench players
  const activePlayers = currentGame.players.filter(p => p.isActive)
  const benchPlayers = currentGame.players.filter(p => !p.isActive)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title={`Game: ${currentGame.name}`} />

      <main className="container mx-auto py-4 px-4">
        {/* Game Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Score */}
          <Scoreboard 
            teamName={currentGame.team}
            opponentName={currentGame.opponent}
            teamScore={currentGame.score.team}
            opponentScore={currentGame.score.opponent}
            onUpdateScore={handleUpdateScore}
          />
          
          {/* Game Clock */}
          <GameClock 
            quarter={currentGame.quarter}
            timeRemaining={gameTime.timeRemaining}
            isRunning={gameTime.isRunning}
            onToggleClock={toggleGameClock}
            onChangeQuarter={changeQuarter}
            onUpdateTime={handleUpdateTime}
          />
          
          {/* AI Insights */}
          <AIInsights insights={currentGame.insights} />
        </div>
        
        {/* Active Players */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Active Players</h2>
            <button 
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-1 px-3 rounded text-sm"
              onClick={() => setSelectedPlayer(null)}
            >
              Reset Selection
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {activePlayers.map(player => (
              <PlayerCard 
                key={player.id}
                player={player}
                stats={currentGame.playerStats[player.id] || initPlayerStats()}
                isSelected={selectedPlayer === player.id}
                onSelect={() => setSelectedPlayer(player.id)}
                onToggleActive={() => handleTogglePlayerActive(player.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Bench Players */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Bench</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {benchPlayers.map(player => (
              <PlayerCard 
                key={player.id}
                player={player}
                stats={currentGame.playerStats[player.id] || initPlayerStats()}
                isSelected={selectedPlayer === player.id}
                onSelect={() => setSelectedPlayer(player.id)}
                onToggleActive={() => handleTogglePlayerActive(player.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Stat Entry Panel */}
        {selectedPlayer !== null && (
          <StatEntryPanel 
            player={currentGame.players.find(p => p.id === selectedPlayer)!}
            stats={currentGame.playerStats[selectedPlayer] || initPlayerStats()}
            onRecordStat={(statType) => handleRecordStat(selectedPlayer, statType)}
          />
        )}
        
        {/* End Game Button */}
        <div className="flex justify-end mt-6">
          <Link 
            href="/dashboard" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              // In a real app, we would update the game status to completed
              // useBasketballStore.getState().updateGameStatus(currentGame.id, 'completed')
            }}
          >
            End Game & View Stats
          </Link>
        </div>
      </main>
    </div>
  )
}
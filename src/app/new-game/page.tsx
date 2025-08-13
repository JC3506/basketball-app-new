'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

// Components
import Navbar from '@/components/Navbar'

// Store
import { useBasketballStore, Player } from '@/lib/store'

export default function NewGame() {
  const router = useRouter()
  const createGame = useBasketballStore(state => state.createGame)
  
  const [gameName, setGameName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [players, setPlayers] = useState<Player[]>([
    { id: uuidv4(), name: '', number: '', position: '', isActive: true },
    { id: uuidv4(), name: '', number: '', position: '', isActive: true },
    { id: uuidv4(), name: '', number: '', position: '', isActive: true },
    { id: uuidv4(), name: '', number: '', position: '', isActive: true },
    { id: uuidv4(), name: '', number: '', position: '', isActive: true }
  ])

  const handlePlayerChange = (id: string, field: keyof Player, value: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, [field]: value } : player
    ))
  }

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, { 
        id: uuidv4(), 
        name: '', 
        number: '', 
        position: '',
        isActive: false
      }])
    }
  }

  const removePlayer = (id: string) => {
    if (players.length > 5) {
      setPlayers(players.filter(player => player.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const isValid = players.every(player => 
      player.name.trim() !== '' && 
      player.number.trim() !== '' && 
      player.position.trim() !== ''
    ) && gameName.trim() !== '' && teamName.trim() !== '' && opponentName.trim() !== ''
    
    if (!isValid) {
      alert('Please fill in all fields')
      return
    }
    
    // Create new game in store
    const gameId = createGame(gameName, teamName, opponentName, players)
    
    // Navigate to game page
    router.push('/game/in-progress')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title="New Game" />

      <main className="container mx-auto py-8 px-4">
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Set Up New Game</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="gameName">
                  Game Name
                </label>
                <input
                  id="gameName"
                  type="text"
                  className="input-field"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="e.g., Championship Finals"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="teamName">
                  Team Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  className="input-field"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Thunderbolts"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="opponentName">
                  Opponent Name
                </label>
                <input
                  id="opponentName"
                  type="text"
                  className="input-field"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  placeholder="e.g., Warriors"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Players</h3>
                <button 
                  type="button" 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                  onClick={addPlayer}
                  disabled={players.length >= 10}
                >
                  Add Player
                </button>
              </div>
              
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={player.id} className="flex flex-wrap md:flex-nowrap gap-4 items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-full md:w-2/5">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1" htmlFor={`playerName-${player.id}`}>
                        Player Name
                      </label>
                      <input
                        id={`playerName-${player.id}`}
                        type="text"
                        className="input-field"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                        placeholder="Player name"
                        required
                      />
                    </div>
                    
                    <div className="w-full md:w-1/5">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1" htmlFor={`playerNumber-${player.id}`}>
                        Number
                      </label>
                      <input
                        id={`playerNumber-${player.id}`}
                        type="text"
                        className="input-field"
                        value={player.number}
                        onChange={(e) => handlePlayerChange(player.id, 'number', e.target.value)}
                        placeholder="#"
                        required
                      />
                    </div>
                    
                    <div className="w-full md:w-1/5">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1" htmlFor={`playerPosition-${player.id}`}>
                        Position
                      </label>
                      <select
                        id={`playerPosition-${player.id}`}
                        className="input-field"
                        value={player.position}
                        onChange={(e) => handlePlayerChange(player.id, 'position', e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        <option value="PG">Point Guard (PG)</option>
                        <option value="SG">Shooting Guard (SG)</option>
                        <option value="SF">Small Forward (SF)</option>
                        <option value="PF">Power Forward (PF)</option>
                        <option value="C">Center (C)</option>
                      </select>
                    </div>
                    
                    <div className="w-full md:w-1/5 flex justify-end items-end">
                      <button 
                        type="button" 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => removePlayer(player.id)}
                        disabled={players.length <= 5}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Link href="/" className="btn-secondary mr-4">
                Cancel
              </Link>
              <button type="submit" className="btn-primary">
                Start Game
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
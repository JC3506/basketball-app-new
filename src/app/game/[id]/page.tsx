'use client'

import { useEffect, useState } from 'react'
import { useBasketballStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EnhancedShotChart from '@/components/EnhancedShotChart'
import ShotInput from '@/components/ShotInput'

export default function GamePage({ params }: { params: { id: string } }) {
  const gameId = params.id
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'shots' | 'insights'>('stats')
  
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId))
  
  useEffect(() => {
    if (!game) {
      router.push('/')
    }
  }, [game, router])
  
  if (!game) {
    return <div>Loading...</div>
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <div className="space-y-6">
            {/* Your existing stats content */}
            <div className="card">
              <h2 className="card-header">Player Statistics</h2>
              {/* Player stats table */}
            </div>
          </div>
        )
      
      case 'shots':
        return (
          <div className="space-y-6">
            <EnhancedShotChart gameId={gameId} />
            <ShotInput gameId={gameId} />
          </div>
        )
      
      case 'insights':
        return (
          <div className="space-y-6">
            {/* Your insights content */}
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
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
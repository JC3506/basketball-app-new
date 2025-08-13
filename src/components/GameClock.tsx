'use client'

import { useState, useEffect } from 'react'

interface GameClockProps {
  quarter: number;
  timeRemaining: string;
  isRunning: boolean;
  onToggleClock: () => void;
  onChangeQuarter: (increment: number) => void;
  onUpdateTime: (time: string) => void;
}

export default function GameClock({
  quarter,
  timeRemaining,
  isRunning,
  onToggleClock,
  onChangeQuarter,
  onUpdateTime
}: GameClockProps) {
  // Parse the time string into minutes and seconds
  const parseTime = (timeStr: string): [number, number] => {
    const [minutes, seconds] = timeStr.split(':').map(Number)
    return [minutes, seconds]
  }
  
  // Update game clock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        const [minutes, seconds] = parseTime(timeRemaining)
        let newSeconds = seconds - 1
        let newMinutes = minutes
        
        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes -= 1
        }
        
        if (newMinutes < 0) {
          // End of quarter
          onToggleClock() // Stop the clock
          return
        }
        
        const newTimeRemaining = `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`
        onUpdateTime(newTimeRemaining)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, onToggleClock, onUpdateTime])

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-3">Game Clock</h2>
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-4 mb-3">
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
            onClick={() => onChangeQuarter(-1)}
            disabled={quarter <= 1}
          >
            &lt;
          </button>
          <span className="text-xl font-bold">Q{quarter}</span>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
            onClick={() => onChangeQuarter(1)}
            disabled={quarter >= 4}
          >
            &gt;
          </button>
        </div>
        
        <div className="text-4xl font-mono font-bold mb-3">
          {timeRemaining}
        </div>
        
        <button 
          className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded`}
          onClick={onToggleClock}
        >
          {isRunning ? 'Stop Clock' : 'Start Clock'}
        </button>
      </div>
    </div>
  )
}
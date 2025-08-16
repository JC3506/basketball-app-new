'use client';
import React, { useState } from 'react';
import { useBasketballStore } from '@/lib/store';
import EnhancedShotChart from './EnhancedShotChart';

// Court dimensions
const courtWidth = 500;
const courtHeight = 470;
const threePointRadius = 237.5;

interface ShotInputProps {
  gameId: string;
}

export default function ShotInput({ gameId }: ShotInputProps) {
  // State
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedDefender, setSelectedDefender] = useState<string>('');
  const [shotType, setShotType] = useState<'2PT' | '3PT' | 'FT'>('2PT');
  const [shotMade, setShotMade] = useState<boolean>(true);
  const [shotPosition, setShotPosition] = useState<{ x: number; y: number } | null>(null);

  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId));
  const recordShot = useBasketballStore(state => state.recordShot);
  const currentQuarter = game?.quarter || 1;

  // Handle court click to set shot position
  const handleCourtClick = (x: number, y: number) => {
    setShotPosition({ x, y });

    // Automatically determine shot type based on position
    const basketY = 25;
    const distanceFromBasket = Math.sqrt(
      Math.pow(x - courtWidth / 2, 2) + Math.pow(y - basketY, 2)
    );

    // Check if shot is beyond the three-point line
    if (
      distanceFromBasket > threePointRadius ||
      (y > courtHeight - 50 && (x < 0 || x > courtWidth))
    ) {
      setShotType('3PT');
    } else {
      setShotType('2PT');
    }
  };

  // Handle shot recording
  const handleRecordShot = () => {
    if (!selectedPlayer || !shotPosition) return;

    recordShot(gameId, {
      x: shotPosition.x,
      y: shotPosition.y,
      made: shotMade,
      playerId: selectedPlayer,
      defenderId: selectedDefender || undefined,
      shotType,
      quarter: currentQuarter,
    });

    // Reset form for next shot
    setShotPosition(null);
    setShotMade(true);
    setSelectedDefender('');
  };

  // Handle free throw recording (no position needed)
  const handleRecordFreeThrow = () => {
    if (!selectedPlayer) return;

    recordShot(gameId, {
      x: courtWidth / 2,
      y: 190, // Free throw line position
      made: shotMade,
      playerId: selectedPlayer,
      defenderId: undefined,
      shotType: 'FT',
      quarter: currentQuarter,
    });

    // Reset form for next shot
    setShotMade(true);
  };

  return (
    
      
        
          
        
        
           handleCourtClick(x, y)}
            gameId={gameId}
            interactive={true}
          />
        
      

      
        
          {/* Player selection */}
          
            Player:
            
              
                Select Player
              
              {game?.players.map(player => (
                
                  {player.name}
                
              ))}
            
          
          {/* Defender selection (optional) */}
          
            Defender:
            
              
                Select Defender (Optional)
              
              {game?.players.map(player => (
                
                  {player.name}
                
              ))}
            
          
          {/* Shot type selection */}
          
            Shot Type:
            
              
                2PT
              
              
                3PT
              
              
                Free Throw
              
            
          
          {/* Shot result */}
          
            Shot Result:
            
              
                Made
              
              
                Missed
              
            
          
          {/* Record shot button */}
          
            {shotType === 'FT' ? (
              Record Free Throw
            ) : (
              Record Shot
            )}
          
          {/* Instructions */}
          
            Click on the court to set shot position.
          
        
      
    
  );
}

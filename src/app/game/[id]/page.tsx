'use client';
import { useEffect, useState, useCallback } from 'react';
import { useBasketballStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EnhancedShotChart from '@/components/EnhancedShotChart';
import ShotInput from '@/components/ShotInput';
import EnhancedAIInsights from '@/components/EnhancedAIInsights';

interface GamePageProps {
  params: {
    id: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const gameId = params.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'shots' | 'insights'>('stats');

  const game = useBasketballStore(state => state.games.find(g => g.id === gameId));
  const updateGameStatus = useBasketballStore(state => state.updateGameStatus);
  const updateGameQuarter = useBasketballStore(state => state.updateGameQuarter);
  const updateGameTime = useBasketballStore(state => state.updateGameTime);
  const updateGameScore = useBasketballStore(state => state.updateGameScore);
  const togglePlayerActive = useBasketballStore(state => state.togglePlayerActive);
  const recordStat = useBasketballStore(state => state.recordStat);

  // Use useCallback for stable references to functions passed to useEffect
  const handleGameNotFound = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (!game) {
      handleGameNotFound();
    }
  }, [game, handleGameNotFound]);

  if (!game) {
    return (
      
        Game not found.
      
    );
  }

  const handleEndGame = () => {
    updateGameStatus(gameId, 'completed');
    router.push('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          
            {/* Stat Recording */}
            
              
                
                  
                  {/*  Add your stat recording components here */}
                
              
            
          
        );
      case 'shots':
        return (
          
            
              
            
          
        );

      case 'insights':
        return (
          
            
              
            
          
        );
    }
  };

  return (
    
      
        
          
        
      

      
        
          
            
              Game Stats
            
            
              Shot Chart
            
            
              AI Insights
            
          
        
        
          End Game
        
        {/* Tab Navigation */}
        
        {/* Tab Content */}
        {renderTabContent()}
      
    
  );
}

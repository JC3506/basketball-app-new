import { useEffect, useState } from 'react';
import { useBasketballStore } from '@/lib/store';
import { useRouter } from 'next/router'; // Note: using next/router instead of next/navigation
import Navbar from '@/components/Navbar';
import EnhancedShotChart from '@/components/EnhancedShotChart';
import ShotInput from '@/components/ShotInput';
import EnhancedAIInsights from '@/components/EnhancedAIInsights';

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query; // Get ID from router.query
  const [activeTab, setActiveTab] = useState<'stats' | 'shots' | 'insights'>('stats');

  const game = useBasketballStore(state =>
    state.games.find(g => g.id === (gameId as string))
  );
  const updateGameStatus = useBasketballStore(state => state.updateGameStatus);
  const updateGameQuarter = useBasketballStore(state => state.updateGameQuarter);
  const updateGameTime = useBasketballStore(state => state.updateGameTime);
  const updateGameScore = useBasketballStore(state => state.updateGameScore);
  const togglePlayerActive = useBasketballStore(state => state.togglePlayerActive);
  const recordStat = useBasketballStore(state => state.recordStat);

  useEffect(() => {
    if (!gameId) {
      return; // Do nothing until gameId is available
    }

    if (!game) {
      router.push('/'); // Redirect if we have gameId but no game
    }
  }, [game, router, gameId]);

  // Show loading while gameId is undefined (initial load)
  if (!gameId) {
    return (
      
        Loading...
      
    );
  }

  // Show not found if we have gameId but no game
  if (!game) {
    return (
      
        Game not found.
      
    );
  }

  const handleEndGame = () => {
    updateGameStatus(gameId as string, 'completed');
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

'use client';
import React, { useState } from 'react';
import { Game, Player, PlayerStats, useBasketballStore } from '@/lib/store';

interface EnhancedAIInsightsProps {
  gameId: string;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
}

export default function EnhancedAIInsights({ gameId }: EnhancedAIInsightsProps) {
  const [activeTab, setActiveTab] = useState<'shooting' | 'chemistry' | 'defense'>('shooting');

  // Get game from store using gameId
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId));

  if (!game) {
    return (
      
        Game not found.
      
    );
  }

  // Generate shooting efficiency insights
  const generateShootingInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Team shooting insights
    let totalFGAttempts = 0;
    let totalFGMade = 0;
    let total3PTAttempts = 0;
    let total3PTMade = 0;

    Object.entries(game.playerStats).forEach(([playerId, stats]) => {
      totalFGAttempts += stats['2PT_MADE'] + stats['2PT_MISS'] + stats['3PT_MADE'] + stats['3PT_MISS'];
      totalFGMade += stats['2PT_MADE'] + stats['3PT_MADE'];
      total3PTAttempts += stats['3PT_MADE'] + stats['3PT_MISS'];
      total3PTMade += stats['3PT_MADE'];
    });

    const fgPercentage = totalFGAttempts > 0 ? (totalFGMade / totalFGAttempts) * 100 : 0;
    const threePtPercentage = total3PTAttempts > 0 ? (total3PTMade / total3PTAttempts) * 100 : 0;

    // Team shooting insights
    if (fgPercentage > 50) {
      insights.push({
        type: 'positive',
        text: `Team shooting efficiency is excellent at ${fgPercentage.toFixed(
          1
        )}%. Continue to focus on high-percentage shots.`,
      });
    } else if (fgPercentage < 40) {
      insights.push({
        type: 'negative',
        text: `Team shooting efficiency is low at ${fgPercentage.toFixed(
          1
        )}%. Consider working on shot selection and offensive execution.`,
      });
    }

    if (threePtPercentage > 40) {
      insights.push({
        type: 'positive',
        text: `Three-point shooting is strong at ${threePtPercentage.toFixed(
          1
        )}%. Leverage this advantage by creating more perimeter opportunities.`,
      });
    } else if (threePtPercentage < 30 && total3PTAttempts > 10) {
      insights.push({
        type: 'negative',
        text: `Three-point shooting is struggling at ${threePtPercentage.toFixed(
          1
        )}%. Consider focusing more on inside scoring or mid-range shots.`,
      });
    }

    // Individual player insights
    game.players.forEach(player => {
      const stats = game.playerStats[player.id];
      if (!stats) return;

      const twoPointAttempts = stats['2PT_MADE'] + stats['2PT_MISS'];
      const twoPointPercentage =
        twoPointAttempts > 0 ? (stats['2PT_MADE'] / twoPointAttempts) * 100 : 0;

      const threePointAttempts = stats['3PT_MADE'] + stats['3PT_MISS'];
      const threePointPercentage =
        threePointAttempts > 0 ? (stats['3PT_MADE'] / threePointAttempts) * 100 : 0;

      if (twoPointAttempts >= 5 && twoPointPercentage > 60) {
        insights.push({
          type: 'positive',
          text: `${player.name} is highly efficient in the paint (${twoPointPercentage.toFixed(
            1
          )}%). Consider running more plays for them inside.`,
        });
      }

      if (threePointAttempts >= 4 && threePointPercentage > 50) {
        insights.push({
          type: 'positive',
          text: `${player.name} is hot from beyond the arc (${threePointPercentage.toFixed(
            1
          )}%). Create more three-point opportunities for them.`,
        });
      }

      if (twoPointAttempts >= 5 && twoPointPercentage < 30) {
        insights.push({
          type: 'negative',
          text: `${player.name} is struggling with inside shots (${twoPointPercentage.toFixed(
            1
          )}%). Consider adjusting their role in the offense.`,
        });
      }
    });

    return insights.length > 0
      ? insights
      : [{ type: 'neutral', text: 'No significant shooting patterns detected yet.' }];
  };

  // Generate player chemistry insights
  const generateChemistryInsights = (): Insight[] => {
    // In a real implementation, this would analyze assist patterns, lineup effectiveness, etc.
    // For now, we'll generate some sample insights
    const insights: Insight[] = [
      {
        type: 'positive',
        text:
          'Players #23 and #30 have connected on 5 assists this game, showing excellent chemistry on the perimeter.',
      },
      {
        type: 'positive',
        text: 'The starting lineup has outscored opponents by 12 points in 15 minutes of play.',
      },
      {
        type: 'negative',
        text: 'The bench unit is struggling with a -8 point differential. Consider adjusting rotations.',
      },
      {
        type: 'neutral',
        text:
          'Small-ball lineup with #6 at center has shown promising ball movement but needs to improve rebounding.',
      },
    ];

    return insights;
  };

  // Generate defensive adjustment insights
  const generateDefensiveInsights = (): Insight[] => {
    // In a real implementation, this would analyze opponent tendencies, defensive stats, etc.
    // For now, we'll generate some sample insights
    const insights: Insight[] = [
      {
        type: 'negative',
        text: 'Opponent is shooting 45% from three-point range. Consider tighter perimeter defense.',
      },
      {
        type: 'positive',
        text:
          "Zone defense has limited opponent's inside scoring to 32% efficiency in the paint.",
      },
      {
        type: 'neutral',
        text:
          "Opponent's #10 has scored 15 points in the last quarter. Consider assigning #6 as primary defender.",
      },
      {
        type: 'negative',
        text:
          'Team has allowed 8 offensive rebounds. Box out needs improvement, especially from the guards.',
      },
    ];

    return insights;
  };

  const activeInsights = (): Insight[] => {
    switch (activeTab) {
      case 'shooting':
        return generateShootingInsights();
      case 'chemistry':
        return generateChemistryInsights();
      case 'defense':
        return generateDefensiveInsights();
      default:
        return [];
    }
  };

  return (
    
      
        
          
            Shooting
          
          
            Chemistry
          
          
            Defense
          
        
      

      
        {activeInsights().map((insight, index) => (
          
            
              {insight.text}
            
          
        ))}
      
    
  );
}

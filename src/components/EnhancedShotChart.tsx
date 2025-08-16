'use client';
import React, { useState, useEffect } from 'react';
import { useBasketballStore } from '@/lib/store';
import { Shot } from '@/lib/store'; // Import the Shot interface

// Court dimensions
const courtWidth = 500;
const courtHeight = 470;
const threePointRadius = 237.5;
const freeThrowRadius = 60;
const basketY = 25;
const basketRadius = 9;

// Shot zone definitions
const shotZones = [
  { name: 'Left Corner 3', color: '#3b82f6' },
  { name: 'Right Corner 3', color: '#3b82f6' },
  { name: 'Above Break 3', color: '#3b82f6' },
  { name: 'Paint', color: '#f59e0b' },
  { name: 'Mid-Range Left', color: '#a855f7' },
  { name: 'Mid-Range Right', color: '#a855f7' },
];

interface EnhancedShotChartProps {
  gameId: string;
  showControls?: boolean;
  height?: number;
  width?: number;
  interactive?: boolean;
  onCourtClick?: (x: number, y: number) => void;
}

export default function EnhancedShotChart({
  gameId,
  showControls = true,
  height = 470,
  width = 500,
  interactive = false,
  onCourtClick,
}: EnhancedShotChartProps) {
  // State
  const [selectedPlayer, setSelectedPlayer] = useState<string | 'all'>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');
  const [selectedShotType, setSelectedShotType] = useState<'all' | '2PT' | '3PT' | 'FT'>('all');
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Get game data from store
  const game = useBasketballStore(state => state.games.find(g => g.id === gameId));
  const getShotsByGame = useBasketballStore(state => state.getShotsByGame);
  const getShotEfficiency = useBasketballStore(state => state.getShotEfficiency);

  // Get shots for this game
  const shots = getShotsByGame(gameId) || [];

  // Filter shots based on selections
  const filteredShots = shots.filter(shot => {
    const playerMatch = selectedPlayer === 'all' || shot.playerId === selectedPlayer;
    const quarterMatch = selectedQuarter === 'all' || shot.quarter === selectedQuarter;
    const shotTypeMatch = selectedShotType === 'all' || shot.shotType === selectedShotType;
    return playerMatch && quarterMatch && shotTypeMatch;
  });

  // Calculate zone statistics
  const zoneStats = shotZones.reduce((acc, zone) => {
    const zoneShots = filteredShots.filter(shot => shot.position?.zone === zone.name);
    const stats = getShotEfficiency(zoneShots);

    acc[zone.name] = { ...stats, color: zone.color };

    return acc;
  }, {} as Record<
    string,
    { made: number; missed: number; total: number; efficiency: number; color: string }
  >);

  // Handle court click for interactive mode
  const handleCourtClick = (e: React.MouseEvent) => {
    if (!interactive || !onCourtClick) return;

    // Get SVG coordinates
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (courtWidth / rect.width);
    const y = (e.clientY - rect.top) * (courtHeight / rect.height);

    onCourtClick(x, y);
  };

  // Render heatmap based on shooting efficiency
  const renderHeatmap = () => {
    // Define court zones
    const zones = [
      {
        name: 'Left Corner 3',
        path: `M0,${courtHeight - 50} L0,${courtHeight} L100,${courtHeight} L100,${courtHeight - 50} Z`,
      },
      {
        name: 'Right Corner 3',
        path: `M${courtWidth - 100},${courtHeight - 50} L${courtWidth - 100},${courtHeight} L${courtWidth},${courtHeight} L${courtWidth},${courtHeight - 50} Z`,
      },
      {
        name: 'Above Break 3',
        path: `M0,${courtHeight - 50} A${threePointRadius},${threePointRadius} 0 0,1 ${courtWidth},${courtHeight - 50} L${courtWidth - 100},${courtHeight - 50} L100,${courtHeight - 50} Z`,
      },
      {
        name: 'Paint',
        path: `M${courtWidth / 2 - 80},0 L${courtWidth / 2 + 80},0 L${courtWidth / 2 + 80},190 L${courtWidth / 2 - 80},190 Z`,
      },
      {
        name: 'Mid-Range Left',
        path: `M0,0 L${courtWidth / 2 - 80},0 L${courtWidth / 2 - 80},190 A${freeThrowRadius},${freeThrowRadius} 0 0,0 ${courtWidth / 2 - 80},${courtHeight - 50} L0,${courtHeight - 50} Z`,
      },
      {
        name: 'Mid-Range Right',
        path: `M${courtWidth / 2 + 80},0 L${courtWidth},0 L${courtWidth},${courtHeight - 50} L${courtWidth / 2 + 80},${courtHeight - 50} A${freeThrowRadius},${freeThrowRadius} 0 0,1 ${courtWidth / 2 + 80},190 Z`,
      },
    ];

    return (
      <>
        {zones.map(zone => {
          const stats = zoneStats[zone.name];
          const efficiency = stats ? stats.efficiency : 0;
          // Calculate opacity based on efficiency (0-100%)
          const opacity = Math.max(0.1, Math.min(1, efficiency / 100)); // Ensure opacity is within 0.1 and 1

          return (
            <path
              key={zone.name}
              d={zone.path}
              fill={zone.color}
              fillOpacity={opacity}
              stroke="black"
              strokeWidth="0.5"
              onMouseEnter={() => setHoveredZone(zone.name)}
              onMouseLeave={() => setHoveredZone(null)}
            />
          );
        })}
      </>
    );
  };

  // Render zone tooltip when hovering over a zone in heatmap mode
  const renderZoneTooltip = () => {
    if (!hoveredZone || !heatmapMode) return null;

    const stats = zoneStats[hoveredZone];
    if (!stats) return null;

    return (
      
        
          
            {hoveredZone}
          
          
            Efficiency: {stats.efficiency.toFixed(1)}%
          
          
            ({stats.made} / {stats.total})
          
        
      
    );
  };
  // Calculate overall shooting efficiency
  const overallStats = getShotEfficiency(filteredShots);

  return (
    
      
        
          
            Shot Chart
          
        
        {showControls && (
          
            
              Player:
              
                
                  All Players
                
                {game?.players.map(player => (
                  
                    {player.name}
                  
                ))}
              
            
            
              Quarter:
              
                
                  All Quarters
                
                
                  1st Quarter
                
                
                  2nd Quarter
                
                
                  3rd Quarter
                
                
                  4th Quarter
                
              
            
            
              Shot Type:
              
                
                  All Types
                
                
                  2PT
                
                
                  3PT
                
                
                  FT
                
              
            
            
              
                Heatmap Mode
              
            
          
        )}
      

      
        {renderZoneTooltip()}
        
          
            
              Overall: {overallStats.efficiency.toFixed(1)}% ({overallStats.made} /{' '}
              {overallStats.total})
            
          
          {heatmapMode ? (
            renderHeatmap()
          ) : (
            <>
              {filteredShots.map(shot => (
                
                  cx={shot.x}
                  cy={shot.y}
                  r={4}
                  fill={shot.made ? 'green' : 'red'}
                  key={shot.id}
                  stroke="black"
                  strokeWidth="0.5"
                />
              ))}
              {/* Basket */}
              
            
          )}
        
      
    
  );
}

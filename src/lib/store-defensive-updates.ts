import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ContestLevel, DefenderInfo, DefenderImpact, TeamDefensiveImpact } from './defensive-impact-types';

// Enhanced Shot interface with defender information
export interface EnhancedShot extends Shot {
  defender?: DefenderInfo;
  contestLevel?: ContestLevel;
}

// Enhanced BasketballStore interface with defensive impact functions
interface EnhancedBasketballStore extends BasketballStore {
  // Record shot with defender information
  recordShotWithDefender: (
    gameId: string,
    shot: Omit<EnhancedShot, 'id' | 'timestamp' | 'gameId' | 'position'>
  ) => void;
  
  // Get defensive impact metrics for a player
  getDefenderImpact: (gameId: string, defenderId: string) => DefenderImpact;
  
  // Get team defensive impact metrics
  getTeamDefensiveImpact: (gameId: string) => TeamDefensiveImpact;
  
  // Get contested shot percentage for a specific zone
  getZoneDefensiveEfficiency: (gameId: string, zone: string) => {
    contested: number;
    uncontested: number;
    contestedEfficiency: number;
    uncontestedEfficiency: number;
  };
  
  // Get matchup statistics between offensive and defensive players
  getPlayerMatchupStats: (gameId: string, offensivePlayerId: string, defensivePlayerId: string) => {
    totalShots: number;
    madeShots: number;
    efficiency: number;
    avgContestLevel: ContestLevel;
  };
}

// Implementation of the enhanced store functions
export const enhanceBasketballStore = (set: any, get: any) => ({
  // Record shot with defender information
  recordShotWithDefender: (
    gameId: string,
    shot: Omit<EnhancedShot, 'id' | 'timestamp' | 'gameId' | 'position'>
  ) => {
    const game = get().getGame(gameId);
    if (!game) return;
    
    // Generate shot ID
    const shotId = uuidv4();
    
    // Calculate shot position data
    const courtWidth = 500;
    const courtHeight = 470;
    const basketY = 25;
    
    // Determine shot zone
    let zone = '';
    const distanceFromBasket = Math.sqrt(
      Math.pow(shot.x - courtWidth/2, 2) + 
      Math.pow(shot.y - basketY, 2)
    );
    
    // Determine zone based on position (same as original implementation)
    if (shot.y < 190 && Math.abs(shot.x - courtWidth/2) < 80) {
      zone = 'Paint';
    } else if (distanceFromBasket > 237.5) {
      if (shot.y > courtHeight - 50) {
        if (shot.x < courtWidth/2) {
          zone = 'Left Corner 3';
        } else {
          zone = 'Right Corner 3';
        }
      } else {
        zone = 'Above Break 3';
      }
    } else {
      if (shot.x < courtWidth/2) {
        zone = 'Mid-Range Left';
      } else {
        zone = 'Mid-Range Right';
      }
    }
    
    // Calculate defender distance if defender position is provided
    let defenderDistance = 0;
    if (shot.defender && shot.defender.position) {
      defenderDistance = Math.sqrt(
        Math.pow(shot.x - shot.defender.position.x, 2) + 
        Math.pow(shot.y - shot.defender.position.y, 2)
      );
      
      // Update defender info with calculated distance
      shot.defender = {
        ...shot.defender,
        distance: defenderDistance
      };
    }
    
    // Create complete shot object
    const newShot: EnhancedShot = {
      id: shotId,
      gameId,
      timestamp: new Date().toISOString(),
      position: {
        zone,
        distance: distanceFromBasket
      },
      ...shot
    };
    
    // Update player stats based on shot (same as original implementation)
    if (shot.shotType === '2PT' && shot.made) {
      get().recordStat(gameId, shot.playerId, '2PT_MADE');
    } else if (shot.shotType === '2PT' && !shot.made) {
      get().recordStat(gameId, shot.playerId, '2PT_MISS');
    } else if (shot.shotType === '3PT' && shot.made) {
      get().recordStat(gameId, shot.playerId, '3PT_MADE');
    } else if (shot.shotType === '3PT' && !shot.made) {
      get().recordStat(gameId, shot.playerId, '3PT_MISS');
    } else if (shot.shotType === 'FT' && shot.made) {
      get().recordStat(gameId, shot.playerId, 'FT_MADE');
    } else if (shot.shotType === 'FT' && !shot.made) {
      get().recordStat(gameId, shot.playerId, 'FT_MISS');
    }
    
    // Update game state with new shot
    set(state => ({
      games: state.games.map(g => 
        g.id === gameId 
          ? { 
              ...g, 
              shots: [...(g.shots || []), newShot] 
            }
          : g
      ),
      currentGame: state.currentGame?.id === gameId 
        ? { 
            ...state.currentGame, 
            shots: [...(state.currentGame.shots || []), newShot] 
          }
        : state.currentGame
    }));
  },
  
  // Get defensive impact metrics for a player
  getDefenderImpact: (gameId: string, defenderId: string): DefenderImpact => {
    const game = get().getGame(gameId);
    if (!game) {
      return {
        defenderId,
        defenderName: 'Unknown',
        totalContests: 0,
        successfulContests: 0,
        contestEfficiency: 0,
        avgContestDistance: 0,
        contestsByLevel: {
          [ContestLevel.UNCONTESTED]: 0,
          [ContestLevel.LIGHT_CONTEST]: 0,
          [ContestLevel.MEDIUM_CONTEST]: 0,
          [ContestLevel.HEAVY_CONTEST]: 0,
          [ContestLevel.BLOCKED]: 0,
        },
        impactByZone: {}
      };
    }
    
    // Find defender name
    const defender = game.players.find(p => p.id === defenderId);
    const defenderName = defender ? defender.name : 'Unknown';
    
    // Filter shots where this player was the defender
    const contestedShots = (game.shots || []).filter(
      shot => (shot as EnhancedShot).defender?.id === defenderId
    ) as EnhancedShot[];
    
    // Calculate metrics
    const totalContests = contestedShots.length;
    const successfulContests = contestedShots.filter(shot => !shot.made).length;
    const contestEfficiency = totalContests > 0 ? (successfulContests / totalContests) * 100 : 0;
    
    // Calculate average contest distance
    const totalDistance = contestedShots.reduce((sum, shot) => 
      sum + (shot.defender?.distance || 0), 0);
    const avgContestDistance = totalContests > 0 ? totalDistance / totalContests : 0;
    
    // Count contests by level
    const contestsByLevel = {
      [ContestLevel.UNCONTESTED]: 0,
      [ContestLevel.LIGHT_CONTEST]: 0,
      [ContestLevel.MEDIUM_CONTEST]: 0,
      [ContestLevel.HEAVY_CONTEST]: 0,
      [ContestLevel.BLOCKED]: 0,
    };
    
    contestedShots.forEach(shot => {
      if (shot.contestLevel) {
        contestsByLevel[shot.contestLevel]++;
      }
    });
    
    // Calculate impact by zone
    const impactByZone: DefenderImpact['impactByZone'] = {};
    
    contestedShots.forEach(shot => {
      const zone = shot.position?.zone || 'Unknown';
      
      if (!impactByZone[zone]) {
        impactByZone[zone] = {
          contests: 0,
          successfulContests: 0,
          efficiency: 0
        };
      }
      
      impactByZone[zone].contests++;
      if (!shot.made) {
        impactByZone[zone].successfulContests++;
      }
    });
    
    // Calculate efficiency for each zone
    Object.keys(impactByZone).forEach(zone => {
      const zoneData = impactByZone[zone];
      zoneData.efficiency = zoneData.contests > 0 
        ? (zoneData.successfulContests / zoneData.contests) * 100 
        : 0;
    });
    
    return {
      defenderId,
      defenderName,
      totalContests,
      successfulContests,
      contestEfficiency,
      avgContestDistance,
      contestsByLevel,
      impactByZone
    };
  },
  
  // Get team defensive impact metrics
  getTeamDefensiveImpact: (gameId: string): TeamDefensiveImpact => {
    const game = get().getGame(gameId);
    if (!game) {
      return {
        totalContests: 0,
        successfulContests: 0,
        contestEfficiency: 0,
        contestsByLevel: {
          [ContestLevel.UNCONTESTED]: 0,
          [ContestLevel.LIGHT_CONTEST]: 0,
          [ContestLevel.MEDIUM_CONTEST]: 0,
          [ContestLevel.HEAVY_CONTEST]: 0,
          [ContestLevel.BLOCKED]: 0,
        },
        zoneDefenseEfficiency: {}
      };
    }
    
    // Filter shots that have defender information
    const contestedShots = (game.shots || []).filter(
      shot => (shot as EnhancedShot).defender
    ) as EnhancedShot[];
    
    // Calculate metrics
    const totalContests = contestedShots.length;
    const successfulContests = contestedShots.filter(shot => !shot.made).length;
    const contestEfficiency = totalContests > 0 ? (successfulContests / totalContests) * 100 : 0;
    
    // Count contests by level
    const contestsByLevel = {
      [ContestLevel.UNCONTESTED]: 0,
      [ContestLevel.LIGHT_CONTEST]: 0,
      [ContestLevel.MEDIUM_CONTEST]: 0,
      [ContestLevel.HEAVY_CONTEST]: 0,
      [ContestLevel.BLOCKED]: 0,
    };
    
    contestedShots.forEach(shot => {
      if (shot.contestLevel) {
        contestsByLevel[shot.contestLevel]++;
      }
    });
    
    // Calculate zone defense efficiency
    const zoneDefenseEfficiency: TeamDefensiveImpact['zoneDefenseEfficiency'] = {};
    
    contestedShots.forEach(shot => {
      const zone = shot.position?.zone || 'Unknown';
      
      if (!zoneDefenseEfficiency[zone]) {
        zoneDefenseEfficiency[zone] = {
          contests: 0,
          successfulContests: 0,
          efficiency: 0
        };
      }
      
      zoneDefenseEfficiency[zone].contests++;
      if (!shot.made) {
        zoneDefenseEfficiency[zone].successfulContests++;
      }
    });
    
    // Calculate efficiency for each zone
    Object.keys(zoneDefenseEfficiency).forEach(zone => {
      const zoneData = zoneDefenseEfficiency[zone];
      zoneData.efficiency = zoneData.contests > 0 
        ? (zoneData.successfulContests / zoneData.contests) * 100 
        : 0;
    });
    
    return {
      totalContests,
      successfulContests,
      contestEfficiency,
      contestsByLevel,
      zoneDefenseEfficiency
    };
  },
  
  // Get contested shot percentage for a specific zone
  getZoneDefensiveEfficiency: (gameId: string, zone: string) => {
    const game = get().getGame(gameId);
    if (!game) {
      return {
        contested: 0,
        uncontested: 0,
        contestedEfficiency: 0,
        uncontestedEfficiency: 0
      };
    }
    
    // Filter shots in the specified zone
    const zoneShots = (game.shots || []).filter(
      shot => shot.position?.zone === zone
    );
    
    // Separate contested and uncontested shots
    const contestedShots = zoneShots.filter(
      shot => (shot as EnhancedShot).defender
    );
    
    const uncontestedShots = zoneShots.filter(
      shot => !(shot as EnhancedShot).defender
    );
    
    // Calculate efficiencies
    const contestedMade = contestedShots.filter(shot => shot.made).length;
    const uncontestedMade = uncontestedShots.filter(shot => shot.made).length;
    
    const contestedEfficiency = contestedShots.length > 0 
      ? (contestedMade / contestedShots.length) * 100 
      : 0;
    
    const uncontestedEfficiency = uncontestedShots.length > 0 
      ? (uncontestedMade / uncontestedShots.length) * 100 
      : 0;
    
    return {
      contested: contestedShots.length,
      uncontested: uncontestedShots.length,
      contestedEfficiency,
      uncontestedEfficiency
    };
  },
  
  // Get matchup statistics between offensive and defensive players
  getPlayerMatchupStats: (gameId: string, offensivePlayerId: string, defensivePlayerId: string) => {
    const game = get().getGame(gameId);
    if (!game) {
      return {
        totalShots: 0,
        madeShots: 0,
        efficiency: 0,
        avgContestLevel: ContestLevel.UNCONTESTED
      };
    }
    
    // Filter shots for this specific matchup
    const matchupShots = (game.shots || []).filter(shot => 
      shot.playerId === offensivePlayerId && 
      (shot as EnhancedShot).defender?.id === defensivePlayerId
    ) as EnhancedShot[];
    
    const totalShots = matchupShots.length;
    const madeShots = matchupShots.filter(shot => shot.made).length;
    const efficiency = totalShots > 0 ? (madeShots / totalShots) * 100 : 0;
    
    // Calculate average contest level
    // Convert contest levels to numeric values for averaging
    const contestLevelValues = {
      [ContestLevel.UNCONTESTED]: 0,
      [ContestLevel.LIGHT_CONTEST]: 1,
      [ContestLevel.MEDIUM_CONTEST]: 2,
      [ContestLevel.HEAVY_CONTEST]: 3,
      [ContestLevel.BLOCKED]: 4
    };
    
    // Calculate average contest level
    let totalContestLevel = 0;
    matchupShots.forEach(shot => {
      if (shot.contestLevel) {
        totalContestLevel += contestLevelValues[shot.contestLevel];
      }
    });
    
    const avgContestLevelValue = totalShots > 0 
      ? totalContestLevel / totalShots 
      : 0;
    
    // Convert back to enum value
    let avgContestLevel = ContestLevel.UNCONTESTED;
    if (avgContestLevelValue >= 3.5) {
      avgContestLevel = ContestLevel.BLOCKED;
    } else if (avgContestLevelValue >= 2.5) {
      avgContestLevel = ContestLevel.HEAVY_CONTEST;
    } else if (avgContestLevelValue >= 1.5) {
      avgContestLevel = ContestLevel.MEDIUM_CONTEST;
    } else if (avgContestLevelValue >= 0.5) {
      avgContestLevel = ContestLevel.LIGHT_CONTEST;
    }
    
    return {
      totalShots,
      madeShots,
      efficiency,
      avgContestLevel
    };
  }
});
// Defensive Impact Analysis - Type Definitions

// Contest level enum for shot defense
export enum ContestLevel {
  UNCONTESTED = 'uncontested',
  LIGHT_CONTEST = 'light_contest',
  MEDIUM_CONTEST = 'medium_contest',
  HEAVY_CONTEST = 'heavy_contest',
  BLOCKED = 'blocked'
}

// Enhanced defender information for shots
export interface DefenderInfo {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  contestLevel: ContestLevel;
  distance: number; // Distance between shooter and defender in feet
  reactionTime?: number; // Time in seconds for defender to close out (optional)
}

// Defensive impact metrics for analysis
export interface DefenderImpact {
  defenderId: string;
  defenderName: string;
  totalContests: number;
  successfulContests: number; // Shots missed when contested
  contestEfficiency: number; // Percentage of successful contests
  avgContestDistance: number;
  contestsByLevel: {
    [ContestLevel.UNCONTESTED]: number;
    [ContestLevel.LIGHT_CONTEST]: number;
    [ContestLevel.MEDIUM_CONTEST]: number;
    [ContestLevel.HEAVY_CONTEST]: number;
    [ContestLevel.BLOCKED]: number;
  };
  impactByZone: {
    [zone: string]: {
      contests: number;
      successfulContests: number;
      efficiency: number;
    };
  };
}

// Team defensive impact metrics
export interface TeamDefensiveImpact {
  totalContests: number;
  successfulContests: number;
  contestEfficiency: number;
  contestsByLevel: {
    [ContestLevel.UNCONTESTED]: number;
    [ContestLevel.LIGHT_CONTEST]: number;
    [ContestLevel.MEDIUM_CONTEST]: number;
    [ContestLevel.HEAVY_CONTEST]: number;
    [ContestLevel.BLOCKED]: number;
  };
  zoneDefenseEfficiency: {
    [zone: string]: {
      contests: number;
      successfulContests: number;
      efficiency: number;
    };
  };
}
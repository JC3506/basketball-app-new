// Updates for store.ts

// 1. Add Shot interface
export interface Shot {
  id: string;
  x: number;
  y: number;
  made: boolean;
  playerId: string;
  defenderId?: string;
  shotType: '2PT' | '3PT' | 'FT';
  quarter: number;
  timestamp: string;
  gameId: string;
  position?: {
    zone: string;
    distance: number;
  };
}

// 2. Update Game interface to include shots array
export interface Game {
  id: string;
  name: string;
  team: string;
  opponent: string;
  date: string;
  players: Player[];
  playerStats: Record<string, PlayerStats>;
  score: {
    team: number;
    opponent: number;
  };
  quarter: number;
  timeRemaining: string;
  status: 'in-progress' | 'completed';
  insights: string[];
  shots: Shot[]; // Add shots array to Game interface
}

// 3. Add recordShot function to BasketballStore interface
interface BasketballStore {
  // ... existing properties
  
  // Shot tracking
  recordShot: (
    gameId: string,
    shot: Omit<Shot, 'id' | 'timestamp' | 'gameId' | 'position'>
  ) => void;
  
  getShotsByGame: (gameId: string) => Shot[];
  getShotsByPlayer: (gameId: string, playerId: string) => Shot[];
  getShotEfficiency: (shots: Shot[]) => {
    made: number;
    missed: number;
    total: number;
    efficiency: number;
  };
}

// 4. Implementation of recordShot function
const recordShot = (
  gameId: string,
  shot: Omit<Shot, 'id' | 'timestamp' | 'gameId' | 'position'>
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
  
  // Determine zone based on position
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
  
  // Create complete shot object
  const newShot: Shot = {
    id: shotId,
    gameId,
    timestamp: new Date().toISOString(),
    position: {
      zone,
      distance: distanceFromBasket
    },
    ...shot
  };
  
  // Update player stats based on shot
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
};

// 5. Implementation of shot retrieval functions
const getShotsByGame = (gameId: string): Shot[] => {
  const game = get().getGame(gameId);
  return game?.shots || [];
};

const getShotsByPlayer = (gameId: string, playerId: string): Shot[] => {
  const shots = get().getShotsByGame(gameId);
  return shots.filter(shot => shot.playerId === playerId);
};

const getShotEfficiency = (shots: Shot[]) => {
  const made = shots.filter(shot => shot.made).length;
  const total = shots.length;
  const missed = total - made;
  const efficiency = total > 0 ? (made / total) * 100 : 0;
  
  return {
    made,
    missed,
    total,
    efficiency
  };
};

// 6. Update createGame function to initialize empty shots array
const createGame = (name: string, team: string, opponent: string, players: Player[]): string => {
  const gameId = uuidv4();
  const playerStats: Record<string, PlayerStats> = {};
  
  // Initialize stats for each player
  players.forEach(player => {
    playerStats[player.id] = initPlayerStats();
  });
  
  const newGame: Game = {
    id: gameId,
    name,
    team,
    opponent,
    date: new Date().toISOString(),
    players,
    playerStats,
    score: { team: 0, opponent: 0 },
    quarter: 1,
    timeRemaining: '12:00',
    status: 'in-progress',
    insights: [],
    shots: [] // Initialize empty shots array
  };
  
  set(state => ({
    games: [...state.games, newGame],
    currentGame: newGame
  }));
  
  return gameId;
};
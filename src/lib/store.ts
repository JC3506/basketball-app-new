import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// Define types
export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  isActive: boolean;
}

export interface PlayerStats {
  PTS: number;
  '2PT_MADE': number;
  '2PT_MISS': number;
  '3PT_MADE': number;
  '3PT_MISS': number;
  'FT_MADE': number;
  'FT_MISS': number;
  'REB_OFF': number;
  'REB_DEF': number;
  AST: number;
  STL: number;
  BLK: number;
  TO: number;
  FOUL: number;
}

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
}

interface BasketballStore {
  games: Game[];
  currentGame: Game | null;
  
  // Game actions
  createGame: (name: string, team: string, opponent: string, players: Player[]) => string;
  updateGameScore: (gameId: string, team: 'team' | 'opponent', points: number) => void;
  updateGameStatus: (gameId: string, status: 'in-progress' | 'completed') => void;
  updateGameQuarter: (gameId: string, quarter: number) => void;
  updateGameTime: (gameId: string, timeRemaining: string) => void;
  
  // Player actions
  togglePlayerActive: (gameId: string, playerId: string) => void;
  
  // Stat actions
  recordStat: (gameId: string, playerId: string, statType: keyof PlayerStats, value?: number) => void;
  
  // Insight actions
  addInsight: (gameId: string, insight: string) => void;
  
  // Helper functions
  getGame: (gameId: string) => Game | undefined;
  getPlayerStats: (gameId: string, playerId: string) => PlayerStats | undefined;
  calculatePlayerEfficiency: (stats: PlayerStats) => number;
}

// Initialize empty player stats
export const initPlayerStats = (): PlayerStats => ({
  PTS: 0,
  '2PT_MADE': 0,
  '2PT_MISS': 0,
  '3PT_MADE': 0,
  '3PT_MISS': 0,
  'FT_MADE': 0,
  'FT_MISS': 0,
  'REB_OFF': 0,
  'REB_DEF': 0,
  AST: 0,
  STL: 0,
  BLK: 0,
  TO: 0,
  FOUL: 0
})

// Create the store
export const useBasketballStore = create<BasketballStore>()(
  persist(
    (set, get) => ({
      games: [],
      currentGame: null,
      
      createGame: (name, team, opponent, players) => {
        const gameId = uuidv4()
        const playerStats: Record<string, PlayerStats> = {}
        
        // Initialize stats for each player
        players.forEach(player => {
          playerStats[player.id] = initPlayerStats()
        })
        
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
          insights: []
        }
        
        set(state => ({
          games: [...state.games, newGame],
          currentGame: newGame
        }))
        
        return gameId
      },
      
      updateGameScore: (gameId, team, points) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { 
                  ...game, 
                  score: { 
                    ...game.score, 
                    [team]: game.score[team] + points 
                  } 
                }
              : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { 
                ...state.currentGame, 
                score: { 
                  ...state.currentGame.score, 
                  [team]: state.currentGame.score[team] + points 
                } 
              }
            : state.currentGame
        }))
      },
      
      updateGameStatus: (gameId, status) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId ? { ...game, status } : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { ...state.currentGame, status } 
            : state.currentGame
        }))
      },
      
      updateGameQuarter: (gameId, quarter) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId ? { ...game, quarter } : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { ...state.currentGame, quarter } 
            : state.currentGame
        }))
      },
      
      updateGameTime: (gameId, timeRemaining) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId ? { ...game, timeRemaining } : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { ...state.currentGame, timeRemaining } 
            : state.currentGame
        }))
      },
      
      togglePlayerActive: (gameId, playerId) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { 
                  ...game, 
                  players: game.players.map(player => 
                    player.id === playerId 
                      ? { ...player, isActive: !player.isActive } 
                      : player
                  ) 
                }
              : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { 
                ...state.currentGame, 
                players: state.currentGame.players.map(player => 
                  player.id === playerId 
                    ? { ...player, isActive: !player.isActive } 
                    : player
                ) 
              }
            : state.currentGame
        }))
      },
      
      recordStat: (gameId, playerId, statType, value = 1) => {
        const game = get().getGame(gameId)
        if (!game) return
        
        const playerStats = { ...game.playerStats[playerId] }
        
        // Handle different stat types
        switch (statType) {
          case '2PT_MADE':
            playerStats['2PT_MADE'] += value
            playerStats.PTS += 2 * value
            break
          case '2PT_MISS':
            playerStats['2PT_MISS'] += value
            break
          case '3PT_MADE':
            playerStats['3PT_MADE'] += value
            playerStats.PTS += 3 * value
            break
          case '3PT_MISS':
            playerStats['3PT_MISS'] += value
            break
          case 'FT_MADE':
            playerStats['FT_MADE'] += value
            playerStats.PTS += value
            break
          case 'FT_MISS':
            playerStats['FT_MISS'] += value
            break
          default:
            playerStats[statType] += value
        }
        
        // Generate insights based on stats
        const player = game.players.find(p => p.id === playerId)
        if (player) {
          get().generateInsights(gameId, playerId, playerStats)
        }
        
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { 
                  ...game, 
                  playerStats: { 
                    ...game.playerStats, 
                    [playerId]: playerStats 
                  } 
                }
              : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { 
                ...state.currentGame, 
                playerStats: { 
                  ...state.currentGame.playerStats, 
                  [playerId]: playerStats 
                } 
              }
            : state.currentGame
        }))
      },
      
      addInsight: (gameId, insight) => {
        set(state => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { 
                  ...game, 
                  insights: [...game.insights, insight].slice(-5) // Keep only the 5 most recent insights
                }
              : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { 
                ...state.currentGame, 
                insights: [...state.currentGame.insights, insight].slice(-5)
              }
            : state.currentGame
        }))
      },
      
      getGame: (gameId) => {
        return get().games.find(game => game.id === gameId)
      },
      
      getPlayerStats: (gameId, playerId) => {
        const game = get().getGame(gameId)
        return game ? game.playerStats[playerId] : undefined
      },
      
      calculatePlayerEfficiency: (stats) => {
        return stats.PTS + stats['REB_OFF'] + stats['REB_DEF'] + stats.AST + stats.STL + stats.BLK - stats.TO - (stats['2PT_MISS'] + stats['3PT_MISS'] + stats['FT_MISS'])
      },
      
      // Helper function to generate insights (not exposed in the interface)
      generateInsights: (gameId, playerId, stats) => {
        const game = get().getGame(gameId)
        if (!game) return
        
        const player = game.players.find(p => p.id === playerId)
        if (!player) return
        
        const newInsights: string[] = []
        
        // Shooting efficiency insights
        const twoPointAttempts = stats['2PT_MADE'] + stats['2PT_MISS']
        const twoPointPercentage = twoPointAttempts > 0 ? (stats['2PT_MADE'] / twoPointAttempts) * 100 : 0
        
        const threePointAttempts = stats['3PT_MADE'] + stats['3PT_MISS']
        const threePointPercentage = threePointAttempts > 0 ? (stats['3PT_MADE'] / threePointAttempts) * 100 : 0
        
        // Generate insights based on performance
        if (twoPointAttempts >= 5 && twoPointPercentage < 30) {
          newInsights.push(`${player.name} is struggling with 2PT shots (${twoPointPercentage.toFixed(1)}%). Consider running plays for better shot selection.`)
        }
        
        if (threePointAttempts >= 3 && threePointPercentage > 50) {
          newInsights.push(`${player.name} is hot from 3PT range (${threePointPercentage.toFixed(1)}%). Look for more opportunities beyond the arc.`)
        }
        
        if (stats.TO >= 3) {
          newInsights.push(`${player.name} has ${stats.TO} turnovers. Consider adjusting ball-handling responsibilities.`)
        }
        
        if (stats.FOUL >= 4) {
          newInsights.push(`⚠️ ${player.name} has ${stats.FOUL} fouls. Consider substitution to avoid fouling out.`)
        }
        
        // Only add new unique insights
        if (newInsights.length > 0) {
          // Add only one insight at a time to avoid flooding
          const randomInsight = newInsights[Math.floor(Math.random() * newInsights.length)]
          get().addInsight(gameId, randomInsight)
        }
      }
    }),
    {
      name: 'basketball-data-storage',
    }
  )
)
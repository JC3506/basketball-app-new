interface ScoreboardProps {
  teamName: string;
  opponentName: string;
  teamScore: number;
  opponentScore: number;
  onUpdateScore: (team: 'team' | 'opponent', points: number) => void;
}

export default function Scoreboard({
  teamName,
  opponentName,
  teamScore,
  opponentScore,
  onUpdateScore
}: ScoreboardProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-3">Score</h2>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm font-bold">{teamName}</p>
          <p className="text-4xl font-bold">{teamScore}</p>
          <div className="mt-2 flex justify-center space-x-2">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('team', 1)}
            >
              +1
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('team', 2)}
            >
              +2
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('team', 3)}
            >
              +3
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold">Opponent</p>
          <p className="text-4xl font-bold">{opponentScore}</p>
          <div className="mt-2 flex justify-center space-x-2">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('opponent', 1)}
            >
              +1
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('opponent', 2)}
            >
              +2
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
              onClick={() => onUpdateScore('opponent', 3)}
            >
              +3
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
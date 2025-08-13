interface AIInsightsProps {
  insights: string[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-3">AI Insights</h2>
      {insights.length > 0 ? (
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm p-2 bg-yellow-50 dark:bg-gray-700 rounded">
              {insight}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Insights will appear as the game progresses
        </p>
      )}
    </div>
  )
}
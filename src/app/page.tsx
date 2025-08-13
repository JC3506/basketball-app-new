import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full bg-primary-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Basketball Data App</h1>
          <p className="text-lg">Real-time basketball player statistics tracking</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="card max-w-4xl w-full my-8">
          <h2 className="text-2xl font-bold mb-6">Welcome to Basketball Data App</h2>
          <p className="mb-6">
            Track real-time basketball player statistics during live games with our intuitive, 
            touch-friendly interface. Get AI-powered insights and strategic recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Link href="/new-game" className="btn-primary text-center py-4">
              Start New Game
            </Link>
            <Link href="/dashboard" className="btn-secondary text-center py-4">
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full my-8">
          <div className="card">
            <h3 className="text-xl font-bold mb-3">Live Stat Tracking</h3>
            <p>Monitor up to 10 players simultaneously with intuitive controls for quick stat entry.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3">AI Integration</h3>
            <p>Get performance insights, strategic adjustments, and predictions based on historical data.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3">Touch-Friendly UI</h3>
            <p>Enjoy a visually engaging, easy-to-navigate interface optimized for fast-paced gameplay.</p>
          </div>
        </div>
      </main>

      <footer className="w-full bg-gray-100 dark:bg-gray-800 p-4 border-t">
        <div className="container mx-auto text-center">
          <p>© 2025 Basketball Data App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
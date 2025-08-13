'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = 'Basketball Data App' }: NavbarProps) {
  const pathname = usePathname()
  
  return (
    <header className="w-full bg-primary-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <Link href="/" className="text-2xl font-bold hover:text-white/80 transition-colors">
            {title}
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link 
            href="/" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/' 
                ? 'bg-primary-800 text-white' 
                : 'text-white/80 hover:bg-primary-600 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/new-game" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/new-game' 
                ? 'bg-primary-800 text-white' 
                : 'text-white/80 hover:bg-primary-600 hover:text-white'
            }`}
          >
            New Game
          </Link>
          <Link 
            href="/dashboard" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/dashboard' 
                ? 'bg-primary-800 text-white' 
                : 'text-white/80 hover:bg-primary-600 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
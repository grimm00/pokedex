import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export const HomePage: React.FC = () => {
  console.log('HomePage rendering...')
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Pokedex
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover, explore, and catch 'em all! Browse through hundreds of Pokemon,
            learn about their types, abilities, and stats in our comprehensive Pokedex.
          </p>

          {isAuthenticated ? (
            <div className="mb-4">
              <p className="text-lg text-green-600 font-medium mb-4">
                Welcome back, {user?.username}! Ready to continue your Pokemon journey?
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-lg text-blue-600 font-medium mb-4">
                Start exploring Pokemon right away - no account needed!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pokemon">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Pokemon
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In for Favorites
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Search & Filter</h3>
            <p className="text-gray-600">
              Find Pokemon by name, type, or other characteristics with our powerful search tools.
              <span className="block mt-2 text-sm text-green-600 font-medium">✓ Available to everyone</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2">Favorites</h3>
            <p className="text-gray-600">
              Save your favorite Pokemon and create your personal collection.
              <span className="block mt-2 text-sm text-blue-600 font-medium">
                {isAuthenticated ? '✓ Available in your account' : 'Sign in to unlock'}
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Detailed Stats</h3>
            <p className="text-gray-600">
              View comprehensive information about each Pokemon's abilities and statistics.
              <span className="block mt-2 text-sm text-green-600 font-medium">✓ Available to everyone</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated ? 'Ready to Continue Your Journey?' : 'Ready to Start Your Journey?'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isAuthenticated
              ? `Welcome back, ${user?.username}! Explore Pokemon, manage your favorites, and discover new features.`
              : 'Join thousands of trainers who have already discovered the amazing world of Pokemon!'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pokemon">
              <Button size="lg">
                {isAuthenticated ? 'Continue Exploring' : 'Start Exploring Now'}
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


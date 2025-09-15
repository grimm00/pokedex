import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const HomePage: React.FC = () => {
  console.log('HomePage rendering...')
  
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pokemon">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Pokemon
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Search & Filter</h3>
            <p className="text-gray-600">
              Find Pokemon by name, type, or other characteristics with our powerful search tools.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2">Favorites</h3>
            <p className="text-gray-600">
              Save your favorite Pokemon and create your personal collection.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Detailed Stats</h3>
            <p className="text-gray-600">
              View comprehensive information about each Pokemon's abilities and statistics.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of trainers who have already discovered the amazing world of Pokemon!
          </p>
          <Link to="/pokemon">
            <Button size="lg">
              Start Exploring Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


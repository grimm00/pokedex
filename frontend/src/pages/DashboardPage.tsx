import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { favoritePokemon, getFavorites, loading } = useFavoritesStore()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
    }
  }, [isAuthenticated, navigate])

  // Load favorites when component mounts
  useEffect(() => {
    if (user && isAuthenticated) {
      getFavorites(user.id)
    }
  }, [user, isAuthenticated, getFavorites])

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Your personal Pokemon trainer dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/pokemon"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Browse Pokemon</h3>
                <p className="text-gray-600">Explore the complete Pokedex</p>
              </div>
            </div>
          </Link>

          <Link
            to="/favorites"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Favorites</h3>
                <p className="text-gray-600">View your favorite Pokemon</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trainer Profile</h3>
                <p className="text-gray-600">Manage your account</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Trainer Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trainer Information</h2>
          <div className="flex items-center space-x-6">
            <div className="bg-gray-200 rounded-full p-8">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Trainer since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Favorites */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Favorites</h2>
            <Link
              to="/favorites"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : favoritePokemon.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoritePokemon.slice(0, 6).map((pokemon) => (
                <Link
                  key={pokemon.pokemon_id}
                  to="/pokemon"
                  className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="bg-gray-100 rounded-lg p-4 mb-2">
                    <div className="text-2xl mb-1">🔍</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">No favorites yet</div>
              <p className="text-gray-400 mb-4">
                Start adding Pokemon to your favorites by browsing the Pokedex
              </p>
              <Link
                to="/pokemon"
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Pokemon
              </Link>
            </div>
          )}
        </div>

        {/* Future Features Placeholder */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-1">Team Builder</h4>
              <p className="text-sm text-gray-600">Create and manage your Pokemon teams</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-1">Search History</h4>
              <p className="text-sm text-gray-600">View your recent Pokemon searches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

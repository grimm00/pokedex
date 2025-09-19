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
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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
            <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
            <Link
              to="/favorites"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All ({favoritePokemon.length})
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : favoritePokemon.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoritePokemon.slice(0, 8).map((pokemon) => {
                const primaryType = pokemon.types?.[0] || 'normal'

                // Type-specific hover colors (simplified for mini cards)
                const getHoverStyle = () => {
                  const colors = {
                    grass: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(255, 255, 255, 0.95))',
                    fire: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 255, 255, 0.95))',
                    water: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(255, 255, 255, 0.95))',
                    electric: 'linear-gradient(135deg, rgba(255, 230, 109, 0.2), rgba(255, 255, 255, 0.95))',
                    psychic: 'linear-gradient(135deg, rgba(227, 136, 216, 0.2), rgba(255, 255, 255, 0.95))',
                    poison: 'linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(255, 255, 255, 0.95))',
                    ice: 'linear-gradient(135deg, rgba(180, 248, 200, 0.2), rgba(255, 255, 255, 0.95))',
                    dragon: 'linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(255, 255, 255, 0.95))',
                    dark: 'linear-gradient(135deg, rgba(44, 62, 80, 0.2), rgba(255, 255, 255, 0.95))',
                    fairy: 'linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(255, 255, 255, 0.95))',
                    normal: 'linear-gradient(135deg, rgba(149, 165, 166, 0.2), rgba(255, 255, 255, 0.95))',
                    fighting: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(255, 255, 255, 0.95))',
                    flying: 'linear-gradient(135deg, rgba(133, 193, 233, 0.2), rgba(255, 255, 255, 0.95))',
                    ground: 'linear-gradient(135deg, rgba(210, 180, 140, 0.2), rgba(255, 255, 255, 0.95))',
                    rock: 'linear-gradient(135deg, rgba(160, 82, 45, 0.2), rgba(255, 255, 255, 0.95))',
                    bug: 'linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(255, 255, 255, 0.95))',
                    ghost: 'linear-gradient(135deg, rgba(142, 68, 173, 0.2), rgba(255, 255, 255, 0.95))',
                    steel: 'linear-gradient(135deg, rgba(127, 140, 141, 0.2), rgba(255, 255, 255, 0.95))',
                  }
                  return colors[primaryType as keyof typeof colors] || 'rgba(255, 255, 255, 0.95)'
                }

                return (
                  <Link
                    key={pokemon.pokemon_id}
                    to="/pokemon"
                    className="group relative overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = getHoverStyle()
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Pokemon Sprite */}
                    <div className="relative mb-3 h-20 flex items-center justify-center">
                      <img
                        src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`}
                        alt={`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} front view`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Pokemon Name */}
                    <h3 className="text-sm font-bold text-center mb-2 capitalize truncate">
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </h3>

                    {/* Pokemon ID */}
                    <div className="text-xs text-gray-500 text-center mb-2">
                      #{pokemon.pokemon_id.toString().padStart(3, '0')}
                    </div>

                    {/* Primary Type Badge */}
                    {pokemon.types && pokemon.types.length > 0 && (
                      <div className="flex justify-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          {pokemon.types[0].charAt(0).toUpperCase() + pokemon.types[0].slice(1)}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
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

          {/* Favorite Types Breakdown */}
          {favoritePokemon.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Favorite Types</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Calculate favorite types
                  const typeCounts: { [key: string]: number } = {}
                  favoritePokemon.forEach(pokemon => {
                    if (pokemon.types && Array.isArray(pokemon.types)) {
                      pokemon.types.forEach((type: string) => {
                        typeCounts[type] = (typeCounts[type] || 0) + 1
                      })
                    }
                  })

                  // Sort by count and take top 5
                  const sortedTypes = Object.entries(typeCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)

                  return sortedTypes.map(([type, count]) => (
                    <span
                      key={type}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                    </span>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Favorites Statistics */}
        {favoritePokemon.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Favorites Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{favoritePokemon.length}</div>
                <div className="text-gray-600">Total Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(() => {
                    const uniqueTypes = new Set()
                    favoritePokemon.forEach(pokemon => {
                      if (pokemon.types && Array.isArray(pokemon.types)) {
                        pokemon.types.forEach((type: string) => uniqueTypes.add(type))
                      }
                    })
                    return uniqueTypes.size
                  })()}
                </div>
                <div className="text-gray-600">Unique Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {favoritePokemon.length > 0 ? Math.round(favoritePokemon.length / 151 * 100) : 0}%
                </div>
                <div className="text-gray-600">Pokedex Completion</div>
              </div>
            </div>
          </div>
        )}

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

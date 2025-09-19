import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

interface Pokemon {
  id: number
  pokemon_id: number
  name: string
  types: string[]
  height: number
  weight: number
  base_experience?: number
  abilities: string[]
  stats: { [key: string]: number }
  sprites: { [key: string]: string }
  created_at?: string
  updated_at?: string
}

interface PokemonModalProps {
  pokemon: Pokemon | null
  isOpen: boolean
  onClose: () => void
}

export const PokemonModal: React.FC<PokemonModalProps> = ({ pokemon, isOpen, onClose }) => {
  if (!isOpen || !pokemon) return null

  const { user, isAuthenticated } = useAuthStore()
  const { isFavorite, toggleFavorite, loading } = useFavoritesStore()

  const isPokemonFavorite = isFavorite(pokemon.pokemon_id)

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated || !user) {
      alert('Please log in to add Pokemon to your favorites!')
      return
    }

    try {
      await toggleFavorite(user.id, pokemon.pokemon_id)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      alert('Failed to update favorites. Please try again.')
    }
  }

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const formatHeight = (height: number) => {
    return `${height / 10}m`
  }

  const formatWeight = (weight: number) => {
    return `${weight / 10}kg`
  }

  const getStatColor = (statName: string) => {
    const colors = {
      hp: 'bg-red-500',
      attack: 'bg-orange-500',
      defense: 'bg-blue-500',
      'special-attack': 'bg-purple-500',
      'special-defense': 'bg-green-500',
      speed: 'bg-yellow-500',
    }
    return colors[statName as keyof typeof colors] || 'bg-gray-500'
  }

  const getStatWidth = (baseStat: number) => {
    // Cap at 150 for display purposes
    return Math.min((baseStat / 150) * 100, 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {formatName(pokemon.name)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pokemon Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <img
                  src={pokemon.sprites.front_default}
                  alt={`${formatName(pokemon.name)} front view`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Types</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`type-badge type-${type}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Height</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatHeight(pokemon.height)}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Weight</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatWeight(pokemon.weight)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {ability.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Base Stats</h3>
            <div className="space-y-3">
              {Object.entries(pokemon.stats).map(([statName, statValue]) => (
                <div key={statName} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-600 capitalize">
                    {statName.replace('-', ' ')}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatColor(statName)}`}
                        style={{ width: `${getStatWidth(statValue)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm font-bold text-gray-900 text-right">
                    {statValue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleFavoriteToggle}
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors ${isPokemonFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPokemonFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


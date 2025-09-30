import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'
import { PokemonSearchMemo as PokemonSearch } from '@/components/pokemon/PokemonSearch'
import { usePokemonStore } from '@/store/pokemonStore'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

// Memoized PokemonPage to prevent unnecessary re-renders
const PokemonPageComponent: React.FC = () => {
  // Only subscribe to the data we actually need
  const pokemon = usePokemonStore((state) => state.pokemon)
  const filteredPokemon = usePokemonStore((state) => state.filteredPokemon)
  const loading = usePokemonStore((state) => state.loading)
  const error = usePokemonStore((state) => state.error)
  const hasMore = usePokemonStore((state) => state.hasMore)
  const total = usePokemonStore((state) => state.total)
  const fetchPokemon = usePokemonStore((state) => state.fetchPokemon)
  const loadMore = usePokemonStore((state) => state.loadMore)
  const clearError = usePokemonStore((state) => state.clearError)
  const { isAuthenticated, user } = useAuthStore()
  const { getFavorites } = useFavoritesStore()

  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasFetched = useRef(false)

  // Fetch Pokemon data on component mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchPokemon()
    }
  }, [fetchPokemon])

  // Load favorites when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      getFavorites(user.id)
    }
  }, [user, isAuthenticated, getFavorites])

  const handlePokemonClick = useCallback((selectedPokemon: any) => {
    setSelectedPokemon(selectedPokemon)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }, [])

  // Stable search handlers that don't change
  const handleSearch = useCallback(async (searchTerm: string, selectedType: string, sortBy?: string) => {
    try {
      // Prevent search with empty or whitespace-only terms from causing issues
      const trimmedSearch = searchTerm?.trim()
      const params = {
        search: trimmedSearch || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        sort: sortBy || undefined,
        page: 1
      }
      await fetchPokemon(params)
    } catch (error) {
      console.error('Search failed:', error)
      // Don't let search errors cause page refreshes
    }
  }, [fetchPokemon])

  const handleClearSearch = useCallback(async () => {
    try {
      await fetchPokemon()
    } catch (error) {
      console.error('Clear search failed:', error)
    }
  }, [fetchPokemon])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, handleCloseModal])

  // Loading state
  if (loading && pokemon.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Pokemon Collection
        </h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg">Loading Pokemon...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Pokemon Collection
        </h1>
        <div className="text-center py-20">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => {
              clearError()
              fetchPokemon()
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Pokemon Collection
      </h1>

      {/* Search Component */}
      <PokemonSearch
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />

      {/* Login Prompt for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Want to save your favorite Pokemon?</h3>
                <p className="text-blue-700">
                  Sign in to add Pokemon to your favorites and access your personal dashboard.
                </p>
              </div>
            </div>
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Pokemon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPokemon.map((poke) => (
          <PokemonCard
            key={poke.pokemon_id}
            pokemon={poke}
            onSelect={handlePokemonClick}
          />
        ))}
      </div>

      {/* Load More Button and Pagination Info */}
      {filteredPokemon.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            Showing {filteredPokemon.length} of {total} Pokemon
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Load More Pokemon'
              )}
            </button>
          )}
          {!hasMore && (
            <div className="text-gray-500 text-sm">
              You've reached the end! All Pokemon have been loaded.
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {filteredPokemon.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No Pokemon found matching your search criteria
          </div>
          <button
            onClick={handleClearSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

// Export memoized component
export const PokemonPage = memo(PokemonPageComponent)

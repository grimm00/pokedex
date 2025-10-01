import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'
import { PokemonSearchMemo as PokemonSearch } from '@/components/pokemon/PokemonSearch'
import { PokemonGridSkeleton } from '@/components/ui/SkeletonLoader'
import GenerationFilter from '@/components/pokemon/GenerationFilter'
import { usePokemonStore } from '@/store/pokemonStore'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { generationService, type Generation } from '@/services/generationService'

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
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all')
  const [generations, setGenerations] = useState<Generation[]>([])
  const [generationsLoading, setGenerationsLoading] = useState(false)
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

  // Fetch generations data
  useEffect(() => {
    const fetchGenerations = async () => {
      setGenerationsLoading(true)
      try {
        const response = await generationService.getGenerations()
        setGenerations(response.generations)
      } catch (error) {
        console.error('Failed to fetch generations:', error)
      } finally {
        setGenerationsLoading(false)
      }
    }

    fetchGenerations()
  }, [])

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

  const handleGenerationChange = useCallback((generation: number | 'all') => {
    setSelectedGeneration(generation)
    // Fetch Pokemon with generation filter
    fetchPokemon({ generation: generation === 'all' ? undefined : generation })
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
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pokemon Collection
        </h1>

        {/* Search Component Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Pokemon Grid Skeleton */}
        <PokemonGridSkeleton count={8} />
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
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Pokemon Collection
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover and explore the amazing world of Pokemon. Search, filter, and find your favorites!
        </p>
      </div>

      {/* Search Component */}
      <PokemonSearch
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />

      {/* Generation Filter */}
      <GenerationFilter
        selectedGeneration={selectedGeneration}
        onGenerationChange={handleGenerationChange}
        generations={generations}
        isLoading={generationsLoading}
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
        <div className="text-center py-12">
          <div className="text-gray-600 mb-6 text-lg">
            Showing <span className="font-semibold text-blue-600">{filteredPokemon.length}</span> of <span className="font-semibold text-purple-600">{total}</span> Pokemon
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Loading more Pokemon...
                  </>
                ) : (
                  <>
                    Load More Pokemon
                    <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              )}
            </button>
          )}
          {!hasMore && (
            <div className="text-gray-500 text-lg">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You've reached the end! All Pokemon have been loaded.
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {filteredPokemon.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Pokemon Found</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              We couldn't find any Pokemon matching your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
          <button
            onClick={handleClearSearch}
            className="group px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear Search & Filters
            </span>
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

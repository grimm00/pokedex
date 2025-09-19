import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'
import { PokemonSearchMemo as PokemonSearch } from '@/components/pokemon/PokemonSearch'
import { usePokemonStore } from '@/store/pokemonStore'

// Memoized PokemonPage to prevent unnecessary re-renders
const PokemonPageComponent: React.FC = () => {
  // Only subscribe to the data we actually need
  const pokemon = usePokemonStore((state) => state.pokemon)
  const filteredPokemon = usePokemonStore((state) => state.filteredPokemon)
  const loading = usePokemonStore((state) => state.loading)
  const error = usePokemonStore((state) => state.error)
  const fetchPokemon = usePokemonStore((state) => state.fetchPokemon)
  const clearError = usePokemonStore((state) => state.clearError)

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

  const handlePokemonClick = useCallback((selectedPokemon: any) => {
    setSelectedPokemon(selectedPokemon)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }, [])

  // Stable search handlers that don't change
  const handleSearch = useCallback(async (searchTerm: string, selectedType: string) => {
    try {
      // Prevent search with empty or whitespace-only terms from causing issues
      const trimmedSearch = searchTerm?.trim()
      const params = {
        search: trimmedSearch || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
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

      {/* Pokemon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPokemon.map((poke) => (
          <PokemonCard
            key={poke.id}
            pokemon={poke}
            onSelect={handlePokemonClick}
          />
        ))}
      </div>

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

import React, { useState, useEffect } from 'react'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'
import { usePokemonStore } from '@/store/pokemonStore'

export const PokemonPage: React.FC = () => {
  console.log('PokemonPage rendering...')

  // Use Zustand store instead of mock data
  const {
    pokemon,
    loading,
    error,
    fetchPokemon,
    clearError
  } = usePokemonStore()

  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch Pokemon data on component mount
  useEffect(() => {
    fetchPokemon()
  }, [fetchPokemon])

  console.log('Pokemon data:', pokemon)

  const handlePokemonClick = (selectedPokemon: any) => {
    console.log('Pokemon clicked:', selectedPokemon.name)
    setSelectedPokemon(selectedPokemon)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }

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
  }, [isModalOpen])

  // Loading state
  if (loading) {
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
        <div className="flex flex-col items-center py-20">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pokemon.map((poke) => (
          <PokemonCard
            key={poke.id}
            pokemon={poke}
            onSelect={handlePokemonClick}
          />
        ))}
      </div>

      {/* Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

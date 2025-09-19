import React from 'react'
import type { Pokemon } from '@/types'
import { PokemonCard } from './PokemonCard'
// import { useFavorites } from '@/hooks/useStore' // Will be used for future features

interface PokemonListProps {
  pokemon: Pokemon[]
  loading?: boolean
  onPokemonClick?: (pokemon: Pokemon) => void
  className?: string
}

export const PokemonList: React.FC<PokemonListProps> = ({
  pokemon,
  loading = false,
  onPokemonClick,
  className
}) => {
  // const favorites = useFavorites() // Will be used for future features

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-pokemon font-bold text-gray-600 mb-2">
          No Pokemon Found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className || ''}`}>
      {pokemon.map((p) => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          onSelect={onPokemonClick}
        />
      ))}
    </div>
  )
}

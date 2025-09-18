import React, { useState } from 'react'
import type { Pokemon } from '@/types/pokemon'
import { TypeBadge } from './TypeBadge'

interface PokemonCardProps {
  pokemon: Pokemon
  onSelect?: (pokemon: Pokemon) => void
  className?: string
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onSelect,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleClick = () => {
    onSelect?.(pokemon)
  }

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
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

  // Get the primary type for hover color
  const primaryType = pokemon.types[0] || 'normal'

  // Type-specific hover colors
  const getHoverStyle = () => {
    if (!isHovered) return {}

    const colors = {
      // Primary types
      grass: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(255, 255, 255, 0.9))',
      fire: 'linear-gradient(135deg, rgba(255, 107, 107, 0.4), rgba(255, 255, 255, 0.9))',
      water: 'linear-gradient(135deg, rgba(78, 205, 196, 0.4), rgba(255, 255, 255, 0.9))',
      electric: 'linear-gradient(135deg, rgba(255, 230, 109, 0.4), rgba(255, 255, 255, 0.9))',
      psychic: 'linear-gradient(135deg, rgba(168, 230, 207, 0.4), rgba(255, 255, 255, 0.9))',
      poison: 'linear-gradient(135deg, rgba(155, 89, 182, 0.4), rgba(255, 255, 255, 0.9))',

      // Additional types
      ice: 'linear-gradient(135deg, rgba(180, 248, 200, 0.4), rgba(255, 255, 255, 0.9))',
      dragon: 'linear-gradient(135deg, rgba(255, 182, 193, 0.4), rgba(255, 255, 255, 0.9))',
      dark: 'linear-gradient(135deg, rgba(44, 62, 80, 0.4), rgba(255, 255, 255, 0.9))',
      fairy: 'linear-gradient(135deg, rgba(255, 182, 193, 0.4), rgba(255, 255, 255, 0.9))',
      normal: 'linear-gradient(135deg, rgba(149, 165, 166, 0.4), rgba(255, 255, 255, 0.9))',
      fighting: 'linear-gradient(135deg, rgba(231, 76, 60, 0.4), rgba(255, 255, 255, 0.9))',
      flying: 'linear-gradient(135deg, rgba(133, 193, 233, 0.4), rgba(255, 255, 255, 0.9))',
      ground: 'linear-gradient(135deg, rgba(210, 180, 140, 0.4), rgba(255, 255, 255, 0.9))',
      rock: 'linear-gradient(135deg, rgba(160, 82, 45, 0.4), rgba(255, 255, 255, 0.9))',
      bug: 'linear-gradient(135deg, rgba(39, 174, 96, 0.4), rgba(255, 255, 255, 0.9))',
      ghost: 'linear-gradient(135deg, rgba(142, 68, 173, 0.4), rgba(255, 255, 255, 0.9))',
      steel: 'linear-gradient(135deg, rgba(127, 140, 141, 0.4), rgba(255, 255, 255, 0.9))',
    }

    return {
      background: colors[primaryType as keyof typeof colors] || 'rgba(255, 255, 255, 0.95)'
    }
  }

  return (
    <div
      className={`${primaryType} cursor-pointer group relative overflow-hidden hover:scale-105 ${className || ''}`}
      style={{
        background: isHovered ? getHoverStyle().background : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pokemon Image */}
      <div className="relative mb-4 h-32 flex items-center justify-center">
        <img
          src={pokemon.sprites.front_default || (pokemon.sprites.other as any)?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`}
          alt={`${formatName(pokemon.name)} front view`}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${isFavorite
            ? 'text-red-500 bg-red-50'
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Pokemon Name */}
      <h3 className="text-lg font-bold text-center mb-2 capitalize">
        {formatName(pokemon.name)}
      </h3>

      {/* Pokemon Types */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {pokemon.types.map((type) => (
          <TypeBadge
            key={type}
            type={type}
          />
        ))}
      </div>

      {/* Pokemon Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="text-center">
          <span className="text-gray-500 block">Height</span>
          <div className="font-semibold">{formatHeight(pokemon.height)}</div>
        </div>
        <div className="text-center">
          <span className="text-gray-500 block">Weight</span>
          <div className="font-semibold">{formatWeight(pokemon.weight)}</div>
        </div>
      </div>

      {/* Action Button */}
      <button
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
      >
        View Details
      </button>
    </div>
  )
}


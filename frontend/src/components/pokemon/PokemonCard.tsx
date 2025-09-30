import React, { useState, useEffect } from 'react'
import type { Pokemon } from '@/types/pokemon'
import { TypeBadge } from './TypeBadge'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useAuthStore } from '@/store/authStore'
import { getAnimatedSpriteUrl, getAlternativeAnimatedSpriteUrl, getStaticSpriteUrl, preloadAnimatedSprite, hasAnimatedSprite } from '@/utils/spriteUtils'

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
  const [animatedSpriteLoaded, setAnimatedSpriteLoaded] = useState(false)
  const [useAnimatedSprite, setUseAnimatedSprite] = useState(false)
  const [spriteFallbackUsed, setSpriteFallbackUsed] = useState(false)
  const { user } = useAuthStore()
  const { isFavorite, toggleFavorite, loading } = useFavoritesStore()

  const isPokemonFavorite = isFavorite(pokemon.pokemon_id)

  // Preload animated sprite when component mounts
  useEffect(() => {
    if (hasAnimatedSprite(pokemon.pokemon_id)) {
      preloadAnimatedSprite(pokemon.pokemon_id)
      setAnimatedSpriteLoaded(true)
    }
  }, [pokemon.pokemon_id])

  // Switch to animated sprite on hover
  useEffect(() => {
    if (isHovered && animatedSpriteLoaded && hasAnimatedSprite(pokemon.pokemon_id)) {
      setUseAnimatedSprite(true)
      setSpriteFallbackUsed(false) // Reset fallback state
    } else {
      setUseAnimatedSprite(false)
      setSpriteFallbackUsed(false) // Reset fallback state
    }
  }, [isHovered, animatedSpriteLoaded, pokemon.pokemon_id])

  const handleClick = () => {
    onSelect?.(pokemon)
  }

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      // Show user-friendly message
      alert('Please log in to add Pokemon to your favorites!')
      return
    }

    // Decode JWT token to see what user ID it contains
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('JWT token user ID:', payload.sub)
      } catch (e) {
        console.log('Could not decode JWT token')
      }
    }

    console.log('Toggling favorite for user ID:', user.id, 'Pokemon ID:', pokemon.pokemon_id)

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

  // Get the primary type for hover color
  const primaryType = pokemon.types[0] || 'normal'

  // Get type color for effects
  const getTypeColor = (type: string) => {
    const colors = {
      grass: '#22c55e',
      fire: '#ef4444',
      water: '#3b82f6',
      electric: '#eab308',
      psychic: '#a855f7',
      poison: '#8b5cf6',
      ice: '#06b6d4',
      dragon: '#f97316',
      dark: '#374151',
      fairy: '#ec4899',
      normal: '#6b7280',
      fighting: '#dc2626',
      flying: '#0ea5e9',
      ground: '#a3a3a3',
      rock: '#78716c',
      bug: '#16a34a',
      ghost: '#7c3aed',
      steel: '#64748b',
    }
    return colors[type as keyof typeof colors] || '#6b7280'
  }

  // Get type-specific battle animations
  const getTypeAnimation = (type: string) => {
    const typeColor = getTypeColor(type)
    
    switch (type) {
      case 'fire':
        return (
          <>
            {/* Fire flicker effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: `radial-gradient(circle, ${typeColor}40 0%, transparent 70%)`,
                animation: 'fireFlicker 1.5s ease-in-out infinite alternate'
              }}
            />
            {/* Fire particles */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-60"
                  style={{
                    background: typeColor,
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                    animation: `fireParticle ${1 + i * 0.2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'water':
        return (
          <>
            {/* Water ripple effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `conic-gradient(from 0deg, ${typeColor}40, transparent, ${typeColor}40)`,
                animation: 'waterRipple 2s linear infinite'
              }}
            />
            {/* Water droplets */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full opacity-50"
                  style={{
                    background: `linear-gradient(45deg, ${typeColor}, transparent)`,
                    left: `${25 + i * 20}%`,
                    top: `${20 + i * 15}%`,
                    animation: `waterDrop ${1.5 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'electric':
        return (
          <>
            {/* Electric spark effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background: `radial-gradient(circle, ${typeColor}60 0%, transparent 50%)`,
                animation: 'electricPulse 0.8s ease-in-out infinite'
              }}
            />
            {/* Electric bolts */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-8 opacity-70"
                  style={{
                    background: `linear-gradient(to bottom, ${typeColor}, transparent)`,
                    left: `${30 + i * 25}%`,
                    top: '10%',
                    animation: `electricBolt ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.2}s`,
                    transform: `rotate(${i * 15 - 15}deg)`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'psychic':
        return (
          <>
            {/* Psychic aura */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `conic-gradient(from 180deg, ${typeColor}40, transparent, ${typeColor}40)`,
                animation: 'psychicAura 3s linear infinite'
              }}
            />
            {/* Floating orbs */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full opacity-60"
                  style={{
                    background: `radial-gradient(circle, ${typeColor}, transparent)`,
                    left: `${20 + i * 30}%`,
                    top: `${25 + i * 20}%`,
                    animation: `psychicOrb ${2 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.7}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'ice':
        return (
          <>
            {/* Ice crystals */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 opacity-70"
                  style={{
                    background: `linear-gradient(45deg, ${typeColor}, white)`,
                    left: `${15 + i * 20}%`,
                    top: `${20 + i * 15}%`,
                    animation: `iceCrystal ${1.5 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'dragon':
        return (
          <>
            {/* Dragon energy */}
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: `radial-gradient(ellipse, ${typeColor}50 0%, transparent 60%)`,
                animation: 'dragonEnergy 2s ease-in-out infinite alternate'
              }}
            />
          </>
        )
      
      case 'flying':
        return (
          <>
            {/* Wind particles */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-50"
                  style={{
                    background: typeColor,
                    left: `${10 + i * 12}%`,
                    top: `${30 + i * 8}%`,
                    animation: `windParticle ${1 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'ground':
        return (
          <>
            {/* Ground particles */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-60"
                  style={{
                    background: typeColor,
                    left: `${20 + i * 15}%`,
                    top: `${70 + i * 5}%`,
                    animation: `groundParticle ${1.5 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.25}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'rock':
        return (
          <>
            {/* Rock fragments */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 opacity-70"
                  style={{
                    background: typeColor,
                    left: `${25 + i * 20}%`,
                    top: `${30 + i * 15}%`,
                    animation: `rockFragment ${2 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'bug':
        return (
          <>
            {/* Bug particles */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-60"
                  style={{
                    background: typeColor,
                    left: `${20 + i * 15}%`,
                    top: `${25 + i * 12}%`,
                    animation: `bugParticle ${1.2 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'ghost':
        return (
          <>
            {/* Ghostly mist */}
            <div 
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${typeColor}30 0%, transparent 70%)`,
                animation: 'ghostMist 3s ease-in-out infinite alternate'
              }}
            />
          </>
        )
      
      case 'steel':
        return (
          <>
            {/* Metallic shine */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `linear-gradient(45deg, transparent 30%, ${typeColor}40 50%, transparent 70%)`,
                animation: 'steelShine 2s ease-in-out infinite'
              }}
            />
          </>
        )
      
      case 'fighting':
        return (
          <>
            {/* Fighting energy */}
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: `conic-gradient(from 0deg, ${typeColor}50, transparent, ${typeColor}50)`,
                animation: 'fightingEnergy 1.5s ease-in-out infinite'
              }}
            />
          </>
        )
      
      case 'poison':
        return (
          <>
            {/* Poison bubbles */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${typeColor}, transparent)`,
                    left: `${25 + i * 20}%`,
                    top: `${30 + i * 15}%`,
                    animation: `poisonBubble ${2 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'fairy':
        return (
          <>
            {/* Fairy sparkles */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-70"
                  style={{
                    background: typeColor,
                    left: `${15 + i * 12}%`,
                    top: `${20 + i * 10}%`,
                    animation: `fairySparkle ${1.5 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </>
        )
      
      case 'dark':
        return (
          <>
            {/* Dark aura */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle, ${typeColor}40 0%, transparent 60%)`,
                animation: 'darkAura 2.5s ease-in-out infinite alternate'
              }}
            />
          </>
        )
      
      default: // normal
        return (
          <>
            {/* Gentle glow for normal types */}
            <div 
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${typeColor}30 0%, transparent 70%)`,
                animation: 'gentleGlow 3s ease-in-out infinite alternate'
              }}
            />
          </>
        )
    }
  }

  // Type-specific hover colors
  const getHoverStyle = () => {
    if (!isHovered) return {}

    const colors = {
      // Primary types
      grass: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(255, 255, 255, 0.9))',
      fire: 'linear-gradient(135deg, rgba(255, 107, 107, 0.4), rgba(255, 255, 255, 0.9))',
      water: 'linear-gradient(135deg, rgba(78, 205, 196, 0.4), rgba(255, 255, 255, 0.9))',
      electric: 'linear-gradient(135deg, rgba(255, 230, 109, 0.4), rgba(255, 255, 255, 0.9))',
      psychic: 'linear-gradient(135deg, rgba(227, 136, 216, 0.4), rgba(255, 255, 255, 0.9))',
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
      className={`${primaryType} cursor-pointer group relative overflow-hidden ${className || ''}`}
      style={{
        background: isHovered ? getHoverStyle().background : 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pokemon Image */}
      <div className="relative mb-4 h-32 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={
              useAnimatedSprite 
                ? spriteFallbackUsed 
                  ? getAlternativeAnimatedSpriteUrl(pokemon.pokemon_id)
                  : getAnimatedSpriteUrl(pokemon.pokemon_id)
                : pokemon.sprites.front_default || getStaticSpriteUrl(pokemon.pokemon_id)
            }
            alt={`${formatName(pokemon.name)} ${useAnimatedSprite ? 'animated' : 'static'} view`}
            className={`w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-2 relative z-10 pokemon-sprite ${useAnimatedSprite ? 'animated gif' : ''}`}
            style={{
              filter: isHovered 
                ? `drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3)) brightness(1.1) contrast(1.1)` 
                : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15)) brightness(1) contrast(1)',
              imageRendering: useAnimatedSprite ? 'auto' : 'crisp-edges',
              // Ensure animated GIFs are constrained to the same size as static sprites
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              // Prevent GIFs from being larger than the container
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            onError={(e) => {
              // Try alternative animated sprite first, then fallback to static
              if (useAnimatedSprite && !spriteFallbackUsed) {
                const target = e.target as HTMLImageElement
                target.src = getAlternativeAnimatedSpriteUrl(pokemon.pokemon_id)
                setSpriteFallbackUsed(true)
              } else if (useAnimatedSprite && spriteFallbackUsed) {
                // Final fallback to static sprite
                const target = e.target as HTMLImageElement
                target.src = pokemon.sprites.front_default || getStaticSpriteUrl(pokemon.pokemon_id)
                setUseAnimatedSprite(false)
                setSpriteFallbackUsed(false)
              }
            }}
          />
          {/* Type-specific battle effects on hover */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {getTypeAnimation(primaryType)}
            </div>
          )}
        </div>

        {/* Animation Indicator */}
        {hasAnimatedSprite(pokemon.pokemon_id) && (
          <div 
            className="absolute top-2 left-2 p-1 rounded-full bg-blue-500/80 backdrop-blur-sm border border-white/30 group/animation"
            title="Hover to see animated sprite!"
          >
            <svg 
              className="w-3 h-3 text-white transition-transform duration-300 group-hover/animation:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isPokemonFavorite
              ? 'text-red-500 bg-red-50 shadow-lg'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:shadow-md'
          }`}
          style={{
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-label={isPokemonFavorite ? 'Remove from favorites' : 'Add to favorites'}
          disabled={loading}
        >
          <svg
            className="w-5 h-5"
            fill={isPokemonFavorite ? 'currentColor' : 'none'}
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
        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:scale-105"
        style={{
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isHovered ? '0 8px 25px -5px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
      >
        <span className="flex items-center justify-center gap-2">
          View Details
          <svg 
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  )
}


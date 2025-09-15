import type { Pokemon, PokemonType } from '@/types'

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatPokemonName = (name: string): string => {
  return capitalize(name.replace(/-/g, ' '))
}

export const formatHeight = (height: number): string => {
  return `${(height / 10).toFixed(1)}m`
}

export const formatWeight = (weight: number): string => {
  return `${(weight / 10).toFixed(1)}kg`
}

export const getPokemonTypeColor = (type: PokemonType): string => {
  const colors = {
    fire: '#FF6B6B',
    water: '#4ECDC4',
    grass: '#45B7D1',
    electric: '#FFE66D',
    psychic: '#A8E6CF',
    ice: '#B4F8C8',
    dragon: '#FFB6C1',
    dark: '#2C3E50',
    fairy: '#FFB6C1',
    normal: '#95A5A6',
    fighting: '#E74C3C',
    flying: '#85C1E9',
    poison: '#9B59B6',
    ground: '#D2B48C',
    rock: '#A0522D',
    bug: '#27AE60',
    ghost: '#8E44AD',
    steel: '#7F8C8D',
  }
  return colors[type] || colors.normal
}

export const getPokemonImage = (pokemon: Pokemon): string => {
  return pokemon.sprites.front_default || 
         '/images/pokemon-placeholder.png'
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

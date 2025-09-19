/**
 * Frontend data validation utilities
 * Helps catch data structure issues early and provides better error messages
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface PokemonData {
  id: number
  pokemon_id: number
  name: string
  height: number
  weight: number
  types: string[]
  abilities: string[]
  stats: Record<string, number>
  sprites: Record<string, string>
  created_at?: string
  updated_at?: string
}

export interface FavoriteData {
  id: number
  user_id: number
  pokemon_id: number
  created_at: string
  pokemon?: PokemonData
}

export interface FavoritesResponse {
  user_id: number
  favorites: FavoriteData[]
}

export class DataValidator {
  /**
   * Validate Pokemon data structure
   */
  static validatePokemonData(pokemon: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!pokemon || typeof pokemon !== 'object') {
      errors.push('Pokemon data must be an object')
      return { valid: false, errors, warnings }
    }

    // Required fields
    const requiredFields = [
      'id', 'pokemon_id', 'name', 'height', 'weight',
      'types', 'abilities', 'stats', 'sprites'
    ]

    for (const field of requiredFields) {
      if (!(field in pokemon)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Type validations
    const typeValidations: Record<string, string> = {
      'id': 'number',
      'pokemon_id': 'number',
      'name': 'string',
      'height': 'number',
      'weight': 'number',
      'types': 'array',
      'abilities': 'array',
      'stats': 'object',
      'sprites': 'object'
    }

    for (const [field, expectedType] of Object.entries(typeValidations)) {
      if (field in pokemon) {
        const actualType = Array.isArray(pokemon[field]) ? 'array' : typeof pokemon[field]
        if (actualType !== expectedType) {
          errors.push(`Field '${field}' should be ${expectedType}, got ${actualType}`)
        }
      }
    }

    // Array content validations (optional - can add more specific checks later)
    if (pokemon.types && Array.isArray(pokemon.types) && pokemon.types.length === 0) {
      warnings.push('types array is empty')
    }
    if (pokemon.abilities && Array.isArray(pokemon.abilities) && pokemon.abilities.length === 0) {
      warnings.push('abilities array is empty')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate favorites response structure
   */
  static validateFavoritesResponse(response: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!response || typeof response !== 'object') {
      errors.push('Favorites response must be an object')
      return { valid: false, errors, warnings }
    }

    // Required fields
    if (!('user_id' in response)) {
      errors.push('Missing required field: user_id')
    }
    if (!('favorites' in response)) {
      errors.push('Missing required field: favorites')
    }

    // Validate user_id type
    if ('user_id' in response && typeof response.user_id !== 'number') {
      errors.push('user_id should be a number')
    }

    // Validate favorites array
    if ('favorites' in response) {
      if (!Array.isArray(response.favorites)) {
        errors.push('favorites should be an array')
      } else {
        // Validate each favorite item
        response.favorites.forEach((favorite: any, index: number) => {
          const favoriteValidation = DataValidator.validateFavoriteData(favorite)
          if (!favoriteValidation.valid) {
            errors.push(`Favorite item ${index}: ${favoriteValidation.errors.join(', ')}`)
          }
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate individual favorite data
   */
  static validateFavoriteData(favorite: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!favorite || typeof favorite !== 'object') {
      errors.push('Favorite data must be an object')
      return { valid: false, errors, warnings }
    }

    // Required fields
    const requiredFields = ['id', 'user_id', 'pokemon_id', 'created_at']
    for (const field of requiredFields) {
      if (!(field in favorite)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Type validations
    if ('id' in favorite && typeof favorite.id !== 'number') {
      errors.push('id should be a number')
    }
    if ('user_id' in favorite && typeof favorite.user_id !== 'number') {
      errors.push('user_id should be a number')
    }
    if ('pokemon_id' in favorite && typeof favorite.pokemon_id !== 'number') {
      errors.push('pokemon_id should be a number')
    }
    if ('created_at' in favorite && typeof favorite.created_at !== 'string') {
      errors.push('created_at should be a string')
    }

    // Check for pokemon data
    if (!('pokemon' in favorite)) {
      warnings.push('Missing pokemon data - favorites may not display correctly')
    } else {
      const pokemonValidation = this.validatePokemonData(favorite.pokemon)
      if (!pokemonValidation.valid) {
        errors.push(`Invalid pokemon data: ${pokemonValidation.errors.join(', ')}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate API response and log issues
   */
  static validateApiResponse(endpoint: string, response: any, validator: (data: any) => ValidationResult): ValidationResult {
    const result = validator(response)

    if (result.valid) {
      console.log(`✅ ${endpoint} response validation passed`)
    } else {
      console.error(`❌ ${endpoint} response validation failed:`, result.errors)
      if (result.warnings.length > 0) {
        console.warn(`⚠️ ${endpoint} response warnings:`, result.warnings)
      }
    }

    return result
  }
}

/**
 * Convenience functions for common validations
 */
export const validateFavoritesResponse = (response: any) =>
  DataValidator.validateApiResponse('Favorites API', response, (data) => DataValidator.validateFavoritesResponse(data))

export const validatePokemonData = (pokemon: any) =>
  DataValidator.validateApiResponse('Pokemon Data', pokemon, (data) => DataValidator.validatePokemonData(data))

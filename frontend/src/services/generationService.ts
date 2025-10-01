import { apiClient } from './apiClient'

export interface Generation {
  generation: number
  name: string
  region: string
  year: number
  pokemon_count: number
  expected_count: number
  color: string
  games: string[]
  description: string
  is_complete: boolean
}

export interface GenerationListResponse {
  generations: Generation[]
  total_generations: number
  total_pokemon: number
  available_generations: number[]
}

class GenerationService {
  /**
   * Fetch all available Pokemon generations
   */
  async getGenerations(): Promise<GenerationListResponse> {
    try {
      const response = await apiClient.get('/api/v1/pokemon/generations')
      return response.data
    } catch (error) {
      console.error('Failed to fetch generations:', error)
      throw new Error('Failed to fetch Pokemon generations')
    }
  }

  /**
   * Get generation data by generation number
   */
  async getGeneration(generation: number): Promise<Generation | null> {
    try {
      const response = await this.getGenerations()
      return response.generations.find(gen => gen.generation === generation) || null
    } catch (error) {
      console.error(`Failed to fetch generation ${generation}:`, error)
      return null
    }
  }

  /**
   * Get Pokemon list filtered by generation
   */
  async getPokemonByGeneration(
    generation: number, 
    page: number = 1, 
    perPage: number = 20,
    additionalParams: Record<string, any> = {}
  ) {
    try {
      const params = {
        generation,
        page,
        per_page: perPage,
        ...additionalParams
      }
      
      const response = await apiClient.get('/api/v1/pokemon', { params })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch Pokemon for generation ${generation}:`, error)
      throw new Error(`Failed to fetch Pokemon for generation ${generation}`)
    }
  }

  /**
   * Get generation color for UI theming
   */
  getGenerationColor(generation: number, generations: Generation[]): string {
    const gen = generations.find(g => g.generation === generation)
    return gen?.color || '#6b7280' // Default gray color
  }

  /**
   * Get generation name for display
   */
  getGenerationName(generation: number, generations: Generation[]): string {
    const gen = generations.find(g => g.generation === generation)
    return gen?.name || `Generation ${generation}`
  }

  /**
   * Check if a generation is complete
   */
  isGenerationComplete(generation: number, generations: Generation[]): boolean {
    const gen = generations.find(g => g.generation === generation)
    return gen?.is_complete || false
  }

  /**
   * Get total Pokemon count across all generations
   */
  getTotalPokemonCount(generations: Generation[]): number {
    return generations.reduce((total, gen) => total + gen.pokemon_count, 0)
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(generations: Generation[]) {
    const totalGenerations = generations.length
    const totalPokemon = this.getTotalPokemonCount(generations)
    const completeGenerations = generations.filter(gen => gen.is_complete).length
    const incompleteGenerations = totalGenerations - completeGenerations

    return {
      totalGenerations,
      totalPokemon,
      completeGenerations,
      incompleteGenerations,
      completionRate: totalGenerations > 0 ? (completeGenerations / totalGenerations) * 100 : 0
    }
  }
}

export const generationService = new GenerationService()

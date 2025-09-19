import { apiClient } from './api'
import type { Pokemon, PokemonListResponse, PokemonDetailResponse, PokemonSearchParams } from '@/types'

export const pokemonService = {
  async getPokemon(params?: PokemonSearchParams): Promise<PokemonListResponse> {
    const searchParams = new URLSearchParams()

    if (params?.search) {
      searchParams.append('search', params.search)
    }
    if (params?.type && params.type !== 'all') {
      searchParams.append('type', params.type)
    }
    if (params?.sort) {
      searchParams.append('sort', params.sort)
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString())
    }
    if (params?.per_page) {
      searchParams.append('per_page', params.per_page.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = `/api/v1/pokemon${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<PokemonListResponse>(endpoint)
    return response.data
  },

  async getPokemonById(id: number): Promise<Pokemon> {
    const response = await apiClient.get<PokemonDetailResponse>(`/api/v1/pokemon/${id}`)
    return response.data.pokemon
  },

  async getPokemonTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/api/v1/pokemon/types')
    return response.data
  },

  async addToFavorites(pokemonId: number): Promise<void> {
    await apiClient.post(`/api/v1/users/favorites/${pokemonId}`)
  },

  async removeFromFavorites(pokemonId: number): Promise<void> {
    await apiClient.delete(`/api/v1/users/favorites/${pokemonId}`)
  },

  async getFavorites(): Promise<number[]> {
    const response = await apiClient.get<number[]>('/api/v1/users/favorites')
    return response.data
  },
}

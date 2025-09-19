import { apiClient } from './api'
import type { Pokemon } from '@/types'

export interface FavoriteResponse {
    user_id: number
    favorites: Array<{
        id: number
        user_id: number
        pokemon_id: number
        created_at: string
        pokemon?: Pokemon
    }>
}

export const favoritesService = {
    async getFavorites(userId: number): Promise<FavoriteResponse> {
        const response = await apiClient.get<FavoriteResponse>(`/api/v1/users/${userId}/favorites`)
        return response.data
    },

    async addFavorite(userId: number, pokemonId: number): Promise<any> {
        const response = await apiClient.post(`/api/v1/users/${userId}/favorites`, {
            pokemon_id: pokemonId
        })
        return response.data
    },

    async removeFavorite(userId: number, pokemonId: number): Promise<void> {
        await apiClient.delete(`/api/v1/users/${userId}/favorites`, {
            body: JSON.stringify({ pokemon_id: pokemonId })
        })
    }
}

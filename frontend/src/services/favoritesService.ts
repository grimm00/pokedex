import { apiClient } from './api'
import type { Pokemon } from '@/types'
import { validateFavoritesResponse } from '@/utils/validators'

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
        
        // Validate response structure
        const validation = validateFavoritesResponse(response.data)
        if (!validation.valid) {
            console.error('Favorites API response validation failed:', validation.errors)
            // Still return the data to avoid breaking the app, but log the issue
        }
        
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
            pokemon_id: pokemonId
        })
    }
}

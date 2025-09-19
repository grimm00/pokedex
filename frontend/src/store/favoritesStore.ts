import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { favoritesService } from '@/services/favoritesService'
import type { Pokemon } from '@/types'

interface FavoritesState {
    // Favorites data
    favorites: number[] // Array of Pokemon IDs
    favoritePokemon: Pokemon[] // Full Pokemon objects

    // UI state
    loading: boolean
    error: string | null
}

interface FavoritesActions {
    // Favorites management
    getFavorites: (userId: number) => Promise<void>
    addFavorite: (userId: number, pokemonId: number) => Promise<void>
    removeFavorite: (userId: number, pokemonId: number) => Promise<void>
    toggleFavorite: (userId: number, pokemonId: number) => Promise<void>

    // Utility actions
    clearError: () => void
    reset: () => void
    isFavorite: (pokemonId: number) => boolean
}

type FavoritesStore = FavoritesState & FavoritesActions

const initialState: FavoritesState = {
    favorites: [],
    favoritePokemon: [],
    loading: false,
    error: null
}

export const useFavoritesStore = create<FavoritesStore>()(
    devtools(
        immer((set, get) => ({
            ...initialState,

            getFavorites: async (userId: number) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    const response = await favoritesService.getFavorites(userId)
                    set((state) => {
                        state.favorites = response.favorites.map(fav => fav.pokemon_id)
                        state.favoritePokemon = response.favorites
                            .filter(fav => fav.pokemon)
                            .map(fav => fav.pokemon!)
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Failed to get favorites'
                        state.loading = false
                    })
                    throw error
                }
            },

            addFavorite: async (userId: number, pokemonId: number) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    await favoritesService.addFavorite(userId, pokemonId)
                    set((state) => {
                        if (!state.favorites.includes(pokemonId)) {
                            state.favorites.push(pokemonId)
                        }
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Failed to add favorite'
                        state.loading = false
                    })
                    throw error
                }
            },

            removeFavorite: async (userId: number, pokemonId: number) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    await favoritesService.removeFavorite(userId, pokemonId)
                    set((state) => {
                        state.favorites = state.favorites.filter(id => id !== pokemonId)
                        state.favoritePokemon = state.favoritePokemon.filter(pokemon => pokemon.pokemon_id !== pokemonId)
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Failed to remove favorite'
                        state.loading = false
                    })
                    throw error
                }
            },

            toggleFavorite: async (userId: number, pokemonId: number) => {
                const { favorites, addFavorite, removeFavorite } = get()

                if (favorites.includes(pokemonId)) {
                    await removeFavorite(userId, pokemonId)
                } else {
                    await addFavorite(userId, pokemonId)
                }
            },

            isFavorite: (pokemonId: number) => {
                const { favorites } = get()
                return favorites.includes(pokemonId)
            },

            clearError: () => {
                set((state) => {
                    state.error = null
                })
            },

            reset: () => {
                set((state) => {
                    state.favorites = []
                    state.favoritePokemon = []
                    state.loading = false
                    state.error = null
                })
            }
        })),
        {
            name: 'favorites-store'
        }
    )
)

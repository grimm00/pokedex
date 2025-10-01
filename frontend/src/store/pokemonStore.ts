import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Pokemon, PokemonSearchParams } from '@/types'
import { pokemonService } from '@/services'

interface PokemonState {
  // Data
  pokemon: Pokemon[]
  filteredPokemon: Pokemon[]
  selectedPokemon: Pokemon | null
  favorites: Set<number>

  // UI State
  loading: boolean
  error: string | null

  // Pagination
  page: number
  hasMore: boolean
  total: number

  // Current filters (for loadMore)
  currentFilters: PokemonSearchParams | null
}

interface PokemonActions {
  // Data Actions
  fetchPokemon: (params?: PokemonSearchParams) => Promise<void>
  fetchPokemonById: (id: number) => Promise<void>
  loadMore: () => Promise<void>
  getPokemonTypes: () => Promise<string[]>

  // UI Actions
  setSelectedPokemon: (pokemon: Pokemon | null) => void

  // Favorites
  addToFavorites: (pokemon: Pokemon) => Promise<void>
  removeFromFavorites: (pokemonId: number) => Promise<void>
  fetchFavorites: () => Promise<void>

  // Utility Actions
  clearError: () => void
  reset: () => void
}

type PokemonStore = PokemonState & PokemonActions

const initialState: PokemonState = {
  pokemon: [],
  filteredPokemon: [],
  selectedPokemon: null,
  favorites: new Set(),
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  total: 0,
  currentFilters: null,
}

export const usePokemonStore = create<PokemonStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      fetchPokemon: async (params?: PokemonSearchParams) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await pokemonService.getPokemon(params)
          set((state) => {
            // Store current filters for loadMore
            state.currentFilters = params || null

            // If this is a search/filter operation, only update filteredPokemon
            // If this is the initial load or clear, update both arrays
            const isSearchOrFilter = params && (params.search || params.type || params.sort || params.generation)

            if (isSearchOrFilter) {
              // Search/filter: completely replace filteredPokemon
              state.filteredPokemon = response.pokemon
            } else {
              // Initial load or clear: update both arrays
              state.pokemon = response.pokemon
              state.filteredPokemon = response.pokemon
            }

            // Always update pagination state from response
            state.total = response.pagination.total
            state.page = response.pagination.page
            state.hasMore = response.pagination.has_next
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
            state.loading = false
          })
        }
      },

      fetchPokemonById: async (id: number) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const pokemon = await pokemonService.getPokemonById(id)
          set((state) => {
            state.selectedPokemon = pokemon
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
            state.loading = false
          })
        }
      },

      loadMore: async () => {
        const { page, hasMore, loading, filteredPokemon, currentFilters } = get()
        if (!hasMore || loading) return

        set((state) => {
          state.loading = true
        })

        try {
          const nextPage = page + 1
          // Use current filters when loading more Pokemon
          const loadMoreParams = {
            ...currentFilters,
            page: nextPage
          }
          const response = await pokemonService.getPokemon(loadMoreParams)
          set((state) => {
            // Deduplicate Pokemon by pokemon_id to avoid duplicate keys
            const existingIds = new Set(filteredPokemon.map(p => p.pokemon_id))
            const newPokemon = response.pokemon.filter(p => !existingIds.has(p.pokemon_id))

            // Only append if we have new Pokemon
            if (newPokemon.length > 0) {
              state.filteredPokemon = [...state.filteredPokemon, ...newPokemon]
              // Also update the main pokemon array if we're not in a filtered state
              if (!currentFilters || (!currentFilters.search && !currentFilters.type && !currentFilters.generation)) {
                state.pokemon = [...state.pokemon, ...newPokemon]
              }
            }

            state.page = nextPage
            state.hasMore = response.pagination.has_next
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load more Pokemon'
            state.loading = false
          })
        }
      },

      getPokemonTypes: async () => {
        try {
          const types = await pokemonService.getPokemonTypes()
          return types
        } catch (error) {
          console.error('Failed to fetch Pokemon types:', error)
          throw error
        }
      },

      setSelectedPokemon: (pokemon: Pokemon | null) => {
        set((state) => {
          state.selectedPokemon = pokemon
        })
      },

      addToFavorites: async (pokemon: Pokemon) => {
        try {
          await pokemonService.addToFavorites(pokemon.id)
          set((state) => {
            state.favorites.add(pokemon.id)
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to add to favorites'
          })
        }
      },

      removeFromFavorites: async (pokemonId: number) => {
        try {
          await pokemonService.removeFromFavorites(pokemonId)
          set((state) => {
            state.favorites.delete(pokemonId)
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to remove from favorites'
          })
        }
      },

      fetchFavorites: async () => {
        try {
          const favorites = await pokemonService.getFavorites()
          set((state) => {
            state.favorites = new Set(favorites.map((fav: any) => fav.pokemon_id))
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch favorites'
          })
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      reset: () => {
        set(initialState)
      },
    })),
    {
      name: 'pokemon-store',
    }
  )
)

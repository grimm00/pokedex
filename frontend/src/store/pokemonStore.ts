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
  searchQuery: string
  typeFilter: string

  // Pagination
  page: number
  hasMore: boolean
  total: number
}

interface PokemonActions {
  // Data Actions
  fetchPokemon: (params?: PokemonSearchParams) => Promise<void>
  fetchPokemonById: (id: number) => Promise<void>
  loadMore: () => Promise<void>
  getPokemonTypes: () => Promise<string[]>

  // UI Actions
  searchPokemon: (query: string) => void
  filterByType: (type: string) => void
  setSelectedPokemon: (pokemon: Pokemon | null) => void

  // Favorites
  addToFavorites: (pokemon: Pokemon) => Promise<void>
  removeFromFavorites: (pokemonId: number) => Promise<void>
  fetchFavorites: () => Promise<void>

  // Utility Actions
  resetFilters: () => void
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
  searchQuery: '',
  typeFilter: 'all',
  page: 1,
  hasMore: true,
  total: 0,
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
            state.pokemon = response.pokemon
            state.filteredPokemon = response.pokemon
            state.total = response.pagination.total
            state.page = response.pagination.page
            state.hasMore = response.pagination.has_next
            state.searchQuery = params?.search || ''
            state.typeFilter = params?.type || 'all'
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
        const { page, hasMore, loading, searchQuery, typeFilter } = get()
        if (!hasMore || loading) return

        set((state) => {
          state.loading = true
        })

        try {
          const nextPage = page + 1
          const params: PokemonSearchParams = {
            page: nextPage,
            search: searchQuery || undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
          }

          const response = await pokemonService.getPokemon(params)
          set((state) => {
            state.pokemon = [...state.pokemon, ...response.pokemon]
            state.filteredPokemon = [...state.filteredPokemon, ...response.pokemon]
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

      searchPokemon: (query: string) => {
        set((state) => {
          state.searchQuery = query
          state.filteredPokemon = state.pokemon.filter((pokemon: Pokemon) =>
            pokemon.name.toLowerCase().includes(query.toLowerCase())
          )
        })
      },

      filterByType: (type: string) => {
        set((state) => {
          state.typeFilter = type
          state.filteredPokemon = state.pokemon.filter((pokemon: Pokemon) =>
            type === 'all' || pokemon.types.includes(type)
          )
        })
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
            state.favorites = new Set(favorites)
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch favorites'
          })
        }
      },

      resetFilters: () => {
        set((state) => {
          state.searchQuery = ''
          state.typeFilter = 'all'
          state.filteredPokemon = state.pokemon
        })
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      reset: () => {
        set(() => ({ ...initialState }))
      },
    })),
    { name: 'pokemon-store' }
  )
)

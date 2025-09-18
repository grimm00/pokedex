import { useCallback } from 'react'
import { usePokemonStore, useUserStore, useUIStore } from '@/store'

// Pokemon selectors
export const usePokemon = () => usePokemonStore((state) => state.pokemon)
export const useFilteredPokemon = () => usePokemonStore((state) => state.filteredPokemon)
export const useSelectedPokemon = () => usePokemonStore((state) => state.selectedPokemon)
export const useFavorites = () => usePokemonStore((state) => state.favorites)
export const usePokemonLoading = () => usePokemonStore((state) => state.loading)
export const usePokemonError = () => usePokemonStore((state) => state.error)
export const useSearchQuery = () => usePokemonStore((state) => state.searchQuery)
export const useTypeFilter = () => usePokemonStore((state) => state.typeFilter)
export const useHasMore = () => usePokemonStore((state) => state.hasMore)

// Pokemon actions
export const usePokemonActions = () => usePokemonStore((state) => ({
  fetchPokemon: state.fetchPokemon,
  fetchPokemonById: state.fetchPokemonById,
  loadMore: state.loadMore,
  searchPokemon: state.searchPokemon,
  filterByType: state.filterByType,
  setSelectedPokemon: state.setSelectedPokemon,
  addToFavorites: state.addToFavorites,
  removeFromFavorites: state.removeFromFavorites,
  fetchFavorites: state.fetchFavorites,
  resetFilters: state.resetFilters,
  clearError: state.clearError,
  reset: state.reset,
}))

// User selectors
export const useUser = () => useUserStore((state) => state.user)
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated)
export const useUserLoading = () => useUserStore((state) => state.loading)
export const useUserError = () => useUserStore((state) => state.error)

// User actions
export const useUserActions = () => useUserStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  refreshToken: state.refreshToken,
  getCurrentUser: state.getCurrentUser,
  updateProfile: state.updateProfile,
  clearError: state.clearError,
  reset: state.reset,
}))

// UI selectors
export const useModals = () => useUIStore((state) => state.modals)
export const useNotifications = () => useUIStore((state) => state.notifications)
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useTheme = () => useUIStore((state) => state.theme)
export const useUILoading = () => useUIStore((state) => state.loading)

// UI actions
export const useUIActions = () => useUIStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setLoading: state.setLoading,
  reset: state.reset,
}))

// Memoized selectors for performance
export const usePokemonStats = () => usePokemonStore(
  useCallback(
    (state) => ({
      total: state.pokemon.length,
      filtered: state.filteredPokemon.length,
      favorites: state.favorites.size,
      hasMore: state.hasMore,
      page: state.page,
    }),
    []
  )
)

export const useIsFavorite = (pokemonId: number) => usePokemonStore(
  useCallback(
    (state) => state.favorites.has(pokemonId),
    [pokemonId]
  )
)


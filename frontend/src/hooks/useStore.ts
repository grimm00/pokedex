import { useCallback } from 'react'
import { usePokemonStore, useAuthStore, useFavoritesStore, useUIStore } from '@/store'

// Pokemon selectors
export const usePokemon = () => usePokemonStore((state) => state.pokemon)
export const useFilteredPokemon = () => usePokemonStore((state) => state.filteredPokemon)
export const useSelectedPokemon = () => usePokemonStore((state) => state.selectedPokemon)
export const usePokemonFavorites = () => usePokemonStore((state) => state.favorites)
export const usePokemonLoading = () => usePokemonStore((state) => state.loading)
export const usePokemonError = () => usePokemonStore((state) => state.error)
export const useHasMore = () => usePokemonStore((state) => state.hasMore)

// Pokemon actions
export const usePokemonActions = () => usePokemonStore((state) => ({
  fetchPokemon: state.fetchPokemon,
  fetchPokemonById: state.fetchPokemonById,
  loadMore: state.loadMore,
  setSelectedPokemon: state.setSelectedPokemon,
  addToFavorites: state.addToFavorites,
  removeFromFavorites: state.removeFromFavorites,
  fetchFavorites: state.fetchFavorites,
  clearError: state.clearError,
  reset: state.reset,
}))

// Auth selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthError = () => useAuthStore((state) => state.error)

// Auth actions
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  checkAuth: state.checkAuth,
  clearError: state.clearError,
}))

// Favorites selectors
export const useFavorites = () => useFavoritesStore((state) => state.favoritePokemon)
export const useFavoriteIds = () => useFavoritesStore((state) => state.favoritePokemonIds)
export const useFavoritesLoading = () => useFavoritesStore((state) => state.loading)
export const useFavoritesError = () => useFavoritesStore((state) => state.error)

// Favorites actions
export const useFavoritesActions = () => useFavoritesStore((state) => ({
  getFavorites: state.getFavorites,
  toggleFavorite: state.toggleFavorite,
  isFavorite: state.isFavorite,
  clearError: state.clearError,
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

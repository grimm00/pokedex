import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, RenderOptions } from '@testing-library/react'

// Mock the stores to avoid complex state management in tests
const mockPokemonStore = {
    pokemon: [],
    loading: false,
    error: null,
    searchTerm: '',
    selectedType: 'all',
    sortBy: 'id',
    fetchPokemon: vi.fn(),
    getPokemonTypes: vi.fn(() => Promise.resolve(['fire', 'water', 'grass'])),
    setSearchTerm: vi.fn(),
    setSelectedType: vi.fn(),
    setSortBy: vi.fn(),
    clearFilters: vi.fn(),
}

const mockAuthStore = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    checkAuth: vi.fn(),
}

const mockFavoritesStore = {
    favorites: [],
    loading: false,
    error: null,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    fetchFavorites: vi.fn(),
    isFavorite: vi.fn(() => false),
}

// Mock the store hooks
vi.mock('@/store/pokemonStore', () => ({
    usePokemonStore: () => mockPokemonStore,
}))

vi.mock('@/store/authStore', () => ({
    useAuthStore: () => mockAuthStore,
}))

vi.mock('@/store/favoritesStore', () => ({
    useFavoritesStore: () => mockFavoritesStore,
}))

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    )
}

const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Export mock stores for test setup
export { mockPokemonStore, mockAuthStore, mockFavoritesStore }


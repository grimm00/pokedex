import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '@/pages/DashboardPage'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

// Mock the stores
const mockAuthStore = {
    isAuthenticated: true,
    user: { id: 1, username: 'testuser', email: 'test@example.com' },
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    checkAuth: vi.fn(),
}

const mockFavoritesStore = {
    favoritePokemon: [
        {
            id: 1,
            pokemon_id: 1,
            name: 'bulbasaur',
            height: 7,
            weight: 69,
            types: ['grass', 'poison'],
            sprites: {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
            }
        },
        {
            id: 25,
            pokemon_id: 25,
            name: 'pikachu',
            height: 4,
            weight: 60,
            types: ['electric'],
            sprites: {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
            }
        }
    ],
    favoritePokemonIds: [1, 25],
    loading: false,
    error: null,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    fetchFavorites: vi.fn(),
    getFavorites: vi.fn(),
    isFavorite: vi.fn((id) => [1, 25].includes(id)),
}

vi.mock('@/store/authStore', () => ({
    useAuthStore: vi.fn(),
}))

vi.mock('@/store/favoritesStore', () => ({
    useFavoritesStore: vi.fn(),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const DashboardWithRouter = () => (
    <BrowserRouter>
        <DashboardPage />
    </BrowserRouter>
)

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
            ; (useAuthStore as unknown as vi.Mock).mockReturnValue(mockAuthStore)
            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(mockFavoritesStore)
    })

    it('renders dashboard content when authenticated', async () => {
        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument()
            expect(screen.getByText('Your personal Pokemon trainer dashboard')).toBeInTheDocument()
        })
    })

    it('displays favorites count', async () => {
        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument() // Favorites count
        })
    })

    it('displays favorite Pokemon cards', async () => {
        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
            expect(screen.getByText('Pikachu')).toBeInTheDocument()
        })
    })

    it('displays type breakdown', async () => {
        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('Favorite Types')).toBeInTheDocument()
            expect(screen.getByText('Grass (1)')).toBeInTheDocument()
            expect(screen.getByText('Poison (1)')).toBeInTheDocument()
            expect(screen.getByText('Electric (1)')).toBeInTheDocument()
        })
    })

    it('shows loading state', () => {
        (useFavoritesStore as unknown as vi.Mock).mockReturnValue({
            ...mockFavoritesStore,
            loading: true,
        })

        render(<DashboardWithRouter />)

        expect(screen.getAllByRole('heading', { name: 'My Favorites' })).toHaveLength(2)
        expect(screen.getByText('Browse Pokemon')).toBeInTheDocument()
    })

    it('shows empty state when no favorites', async () => {
        (useFavoritesStore as unknown as vi.Mock).mockReturnValue({
            ...mockFavoritesStore,
            favoritePokemon: [],
            favoritePokemonIds: [],
        })

        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('No favorites yet')).toBeInTheDocument()
            expect(screen.getByText('Explore the complete Pokehub')).toBeInTheDocument()
        })
    })

    it('redirects to auth when not authenticated', () => {
        (useAuthStore as unknown as vi.Mock).mockReturnValue({
            ...mockAuthStore,
            isAuthenticated: false,
        })

        render(<DashboardWithRouter />)

        expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    it('calls getFavorites when component mounts', () => {
        render(<DashboardWithRouter />)

        expect(mockFavoritesStore.getFavorites).toHaveBeenCalledWith(1) // user.id
    })

    it('displays statistics correctly', async () => {
        render(<DashboardWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('Total Favorites')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
            expect(screen.getByText('Unique Types')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument() // grass, poison, electric
        })
    })

    it('handles error state', () => {
        const errorStore = {
            ...mockFavoritesStore,
            error: 'Failed to load favorites',
        }

            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(errorStore)

        render(<DashboardWithRouter />)

        // The DashboardPage component doesn't display error messages
        // It just shows the loading state or favorites
        // This test verifies that the component renders without crashing
        expect(screen.getAllByRole('heading', { name: 'My Favorites' })).toHaveLength(2)
    })
})

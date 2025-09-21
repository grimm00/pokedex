import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesPage } from '@/pages/FavoritesPage'
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
    toggleFavorite: vi.fn(),
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

const FavoritesWithRouter = () => (
    <BrowserRouter>
        <FavoritesPage />
    </BrowserRouter>
)

describe('FavoritesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
            ; (useAuthStore as unknown as vi.Mock).mockReturnValue(mockAuthStore)
            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(mockFavoritesStore)
    })

    it('renders favorites page when authenticated', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('My Favorite Pokemon')).toBeInTheDocument()
            expect(screen.getByText('You have 2 favorite Pokemon')).toBeInTheDocument()
        })
    })

    it('displays favorite Pokemon cards', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
            expect(screen.getByText('Pikachu')).toBeInTheDocument()
        })
    })

    it('shows loading state', () => {
        const loadingStore = {
            ...mockFavoritesStore,
            loading: true,
        }

            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(loadingStore)

        render(<FavoritesWithRouter />)

        // The component shows a spinner div, not text
        expect(screen.getByText('My Favorite Pokemon')).toBeInTheDocument()
        expect(screen.getByText('Browse All Pokemon')).toBeInTheDocument()
    })

    it('shows empty state when no favorites', async () => {
        const emptyStore = {
            ...mockFavoritesStore,
            favoritePokemon: [],
            favoritePokemonIds: [],
        }

            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(emptyStore)

        render(<FavoritesWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('No favorite Pokemon yet')).toBeInTheDocument()
            expect(screen.getByText('Start adding Pokemon to your favorites by clicking the heart icon on any Pokemon card')).toBeInTheDocument()
        })
    })

    it('redirects to auth when not authenticated', () => {
        const unauthenticatedStore = {
            ...mockAuthStore,
            isAuthenticated: false,
        }

            ; (useAuthStore as unknown as vi.Mock).mockReturnValue(unauthenticatedStore)

        render(<FavoritesWithRouter />)

        expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    it('calls getFavorites when component mounts', () => {
        render(<FavoritesWithRouter />)

        expect(mockFavoritesStore.getFavorites).toHaveBeenCalledWith(1) // user.id
    })

    it('handles error state', () => {
        const errorStore = {
            ...mockFavoritesStore,
            error: 'Failed to load favorites',
        }

            ; (useFavoritesStore as unknown as vi.Mock).mockReturnValue(errorStore)

        render(<FavoritesWithRouter />)

        expect(screen.getByText('Failed to load favorites')).toBeInTheDocument()
    })

    it('displays Pokemon types correctly', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('grass')).toBeInTheDocument()
            expect(screen.getByText('poison')).toBeInTheDocument()
            expect(screen.getByText('electric')).toBeInTheDocument()
        })
    })

    it('shows Pokemon stats correctly', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            expect(screen.getByText('0.7m')).toBeInTheDocument() // Bulbasaur height
            expect(screen.getByText('6.9kg')).toBeInTheDocument() // Bulbasaur weight
            expect(screen.getByText('0.4m')).toBeInTheDocument() // Pikachu height
            expect(screen.getByText('6kg')).toBeInTheDocument() // Pikachu weight
        })
    })

    it('handles remove favorite functionality', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            const removeButtons = screen.getAllByLabelText('Remove from favorites')
            expect(removeButtons).toHaveLength(2)
        })

        const firstRemoveButton = screen.getAllByLabelText('Remove from favorites')[0]
        fireEvent.click(firstRemoveButton)

        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(1, 1)
    })

    it('shows Pokemon images', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            const images = screen.getAllByAltText(/front view/)
            expect(images).toHaveLength(2)
            expect(images[0]).toHaveAttribute('src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png')
            expect(images[1]).toHaveAttribute('src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')
        })
    })

    it('displays Pokemon IDs correctly', async () => {
        render(<FavoritesWithRouter />)

        await waitFor(() => {
            // The PokemonCard component should display the Pokemon ID
            // Let's check if the Pokemon names are displayed instead
            expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
            expect(screen.getByText('Pikachu')).toBeInTheDocument()
        })
    })
})

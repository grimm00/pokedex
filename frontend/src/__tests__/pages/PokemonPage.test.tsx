import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PokemonPage } from './PokemonPage'

// Mock the pokemon store
const mockPokemonStore = {
    pokemon: [
        {
            id: 1,
            pokemon_id: 1,
            name: 'bulbasaur',
            height: 7,
            weight: 69,
            base_experience: 64,
            types: ['grass', 'poison'],
            abilities: ['overgrow', 'chlorophyll'],
            stats: {
                hp: 45,
                attack: 49,
                defense: 49,
                'special-attack': 65,
                'special-defense': 65,
                speed: 45
            },
            sprites: {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
            },
            created_at: '2024-12-19T00:00:00Z',
            updated_at: '2024-12-19T00:00:00Z'
        },
        {
            id: 2,
            pokemon_id: 2,
            name: 'ivysaur',
            height: 10,
            weight: 130,
            base_experience: 142,
            types: ['grass', 'poison'],
            abilities: ['overgrow', 'chlorophyll'],
            stats: {
                hp: 60,
                attack: 62,
                defense: 63,
                'special-attack': 80,
                'special-defense': 80,
                speed: 60
            },
            sprites: {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png'
            },
            created_at: '2024-12-19T00:00:00Z',
            updated_at: '2024-12-19T00:00:00Z'
        }
    ],
    filteredPokemon: [
        {
            id: 1,
            pokemon_id: 1,
            name: 'bulbasaur',
            height: 7,
            weight: 69,
            base_experience: 64,
            types: ['grass', 'poison'],
            abilities: ['overgrow', 'chlorophyll'],
            stats: {
                hp: 45,
                attack: 49,
                defense: 49,
                'special-attack': 65,
                'special-defense': 65,
                speed: 45
            },
            sprites: {
                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
            },
            created_at: '2024-12-19T00:00:00Z',
            updated_at: '2024-12-19T00:00:00Z'
        }
    ],
    loading: false,
    error: null,
    searchQuery: '',
    typeFilter: 'all',
    pokemonTypes: ['grass', 'poison', 'fire', 'water'],
    fetchPokemon: vi.fn(),
    loadMore: vi.fn(),
    getPokemonTypes: vi.fn(),
    handleSearch: vi.fn(),
    handleClearSearch: vi.fn(),
    filterByType: vi.fn(),
    selectPokemon: vi.fn(),
    clearSelectedPokemon: vi.fn()
}

// Mock the pokemon store
vi.mock('@/store/pokemonStore', () => ({
    usePokemonStore: () => mockPokemonStore
}))

describe('PokemonPage', () => {
    it('renders pokemon cards with types', async () => {
        render(<PokemonPage />)

        // Wait for the component to render
        await waitFor(() => {
            expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
        })

        // Check if types are displayed
        expect(screen.getByText('grass')).toBeInTheDocument()
        expect(screen.getByText('poison')).toBeInTheDocument()
    })

    it('renders search component', () => {
        render(<PokemonPage />)

        expect(screen.getByPlaceholderText(/search pokemon/i)).toBeInTheDocument()
    })

    it('displays pokemon count', async () => {
        render(<PokemonPage />)

        await waitFor(() => {
            expect(screen.getByText(/1 pokemon found/i)).toBeInTheDocument()
        })
    })

    it('handles empty state', async () => {
        const emptyStore = {
            ...mockPokemonStore,
            filteredPokemon: []
        }

        vi.mocked(require('@/store/pokemonStore').usePokemonStore).mockReturnValue(emptyStore)

        render(<PokemonPage />)

        await waitFor(() => {
            expect(screen.getByText(/no pokemon found/i)).toBeInTheDocument()
        })
    })

    it('handles loading state', () => {
        const loadingStore = {
            ...mockPokemonStore,
            loading: true,
            pokemon: [],
            filteredPokemon: []
        }

        vi.mocked(require('@/store/pokemonStore').usePokemonStore).mockReturnValue(loadingStore)

        render(<PokemonPage />)

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('handles error state', () => {
        const errorStore = {
            ...mockPokemonStore,
            error: 'Failed to fetch Pokemon',
            pokemon: [],
            filteredPokemon: []
        }

        vi.mocked(require('@/store/pokemonStore').usePokemonStore).mockReturnValue(errorStore)

        render(<PokemonPage />)

        expect(screen.getByText(/failed to fetch pokemon/i)).toBeInTheDocument()
    })
})

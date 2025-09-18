import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PokemonPage } from '@/pages/PokemonPage'

// Mock the Pokemon store
const mockPokemon = [
  {
    id: 1,
    pokemon_id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    types: ['grass', 'poison'],
    abilities: ['overgrow', 'chlorophyll'],
    stats: { hp: 45, attack: 49, defense: 49 },
    sprites: { front_default: 'https://example.com/bulbasaur.png' }
  },
  {
    id: 4,
    pokemon_id: 4,
    name: 'charmander',
    height: 6,
    weight: 85,
    types: ['fire'],
    abilities: ['blaze', 'solar-power'],
    stats: { hp: 39, attack: 52, defense: 43 },
    sprites: { front_default: 'https://example.com/charmander.png' }
  },
  {
    id: 7,
    pokemon_id: 7,
    name: 'squirtle',
    height: 5,
    weight: 90,
    types: ['water'],
    abilities: ['torrent', 'rain-dish'],
    stats: { hp: 44, attack: 48, defense: 65 },
    sprites: { front_default: 'https://example.com/squirtle.png' }
  }
]

const mockFetchPokemon = vi.fn()
const mockClearError = vi.fn()

const mockUsePokemonStore = vi.fn(() => ({
  pokemon: mockPokemon,
  filteredPokemon: mockPokemon,
  loading: false,
  error: null,
  searchQuery: '',
  typeFilter: 'all',
  fetchPokemon: mockFetchPokemon,
  clearError: mockClearError,
}))

vi.mock('@/store/pokemonStore', () => ({
  usePokemonStore: mockUsePokemonStore,
}))

describe('PokemonPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Pokemon page with search functionality', () => {
    render(<PokemonPage />)
    
    expect(screen.getByText('Pokemon Collection')).toBeInTheDocument()
    expect(screen.getByText('Search Pokemon')).toBeInTheDocument()
    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument()
  })

  it('displays Pokemon cards', () => {
    render(<PokemonPage />)
    
    expect(screen.getByText('bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('charmander')).toBeInTheDocument()
    expect(screen.getByText('squirtle')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUsePokemonStore.mockReturnValue({
      pokemon: [],
      filteredPokemon: [],
      loading: true,
      error: null,
      searchQuery: '',
      typeFilter: 'all',
      fetchPokemon: mockFetchPokemon,
      clearError: mockClearError,
    })
    
    render(<PokemonPage />)
    
    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUsePokemonStore.mockReturnValue({
      pokemon: [],
      filteredPokemon: [],
      loading: false,
      error: 'Failed to fetch Pokemon',
      searchQuery: '',
      typeFilter: 'all',
      fetchPokemon: mockFetchPokemon,
      clearError: mockClearError,
    })
    
    render(<PokemonPage />)
    
    expect(screen.getByText('Error: Failed to fetch Pokemon')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    vi.useFakeTimers()
    render(<PokemonPage />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    fireEvent.change(searchInput, { target: { value: 'char' } })
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockFetchPokemon).toHaveBeenCalledWith({
        search: 'char',
        type: undefined,
        page: 1
      })
    })
    
    vi.useRealTimers()
  })

  it('handles type filtering', async () => {
    vi.useFakeTimers()
    render(<PokemonPage />)
    
    const typeSelect = screen.getByLabelText(/filter by type/i)
    fireEvent.change(typeSelect, { target: { value: 'fire' } })
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockFetchPokemon).toHaveBeenCalledWith({
        search: undefined,
        type: 'fire',
        page: 1
      })
    })
    
    vi.useRealTimers()
  })

  it('handles combined search and filter', async () => {
    vi.useFakeTimers()
    render(<PokemonPage />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    const typeSelect = screen.getByLabelText(/filter by type/i)
    
    fireEvent.change(searchInput, { target: { value: 'char' } })
    fireEvent.change(typeSelect, { target: { value: 'fire' } })
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockFetchPokemon).toHaveBeenCalledWith({
        search: 'char',
        type: 'fire',
        page: 1
      })
    })
    
    vi.useRealTimers()
  })

  it('shows result count when filters are active', () => {
    mockUsePokemonStore.mockReturnValue({
      pokemon: mockPokemon,
      filteredPokemon: [mockPokemon[1]], // Only charmander
      loading: false,
      error: null,
      searchQuery: 'char',
      typeFilter: 'fire',
      fetchPokemon: mockFetchPokemon,
      clearError: mockClearError,
    })
    
    render(<PokemonPage />)
    
    expect(screen.getByText('Found 1 Pokemon matching "char" of type fire')).toBeInTheDocument()
  })

  it('handles clear search functionality', async () => {
    vi.useFakeTimers()
    render(<PokemonPage />)
    
    const clearButton = screen.getByText(/clear all filters/i)
    fireEvent.click(clearButton)
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockFetchPokemon).toHaveBeenCalledWith()
    })
    
    vi.useRealTimers()
  })
})
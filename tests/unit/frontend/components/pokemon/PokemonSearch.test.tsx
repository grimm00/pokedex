import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PokemonSearchMemo as PokemonSearch } from '@/components/pokemon/PokemonSearch'

// Mock the Zustand store
vi.mock('@/store/pokemonStore', () => ({
  usePokemonStore: vi.fn(),
}))

const mockGetPokemonTypes = vi.fn(() => Promise.resolve(['fire', 'water', 'grass']))
const mockOnSearch = vi.fn()
const mockOnClear = vi.fn()

// Import the mocked store
import { usePokemonStore } from '@/store/pokemonStore'

describe('PokemonSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
      // Reset the mock store for each test
      ; (usePokemonStore as unknown as vi.Mock).mockReturnValue({
        getPokemonTypes: mockGetPokemonTypes,
      })
  })

  it('renders search input and type filter', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    expect(screen.getByPlaceholderText('Enter Pokemon name...')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument()
      expect(screen.getByText('Water')).toBeInTheDocument()
      expect(screen.getByText('Grass')).toBeInTheDocument()
    })
  })

  it('calls onSearch immediately when search input changes', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')
    fireEvent.change(searchInput, { target: { value: 'char' } })

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('char', 'all', 'id')
    })
  })

  it('calls onSearch when type filter changes', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    // Clear any initial calls
    mockOnSearch.mockClear()

    const typeFilter = screen.getByLabelText('Filter by type')

    await act(async () => {
      fireEvent.change(typeFilter, { target: { value: 'fire' } })
    })

    // Wait for the useEffect to trigger - now includes sort parameter
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('', 'fire', 'id')
    }, { timeout: 2000 })
  })

  it('calls onClear when Clear All Filters button is clicked', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')
    fireEvent.change(searchInput, { target: { value: 'char' } })

    const clearButton = screen.getByText('Clear All Filters')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(mockOnClear).toHaveBeenCalled()
      expect(searchInput).toHaveValue('')
      expect(screen.getByLabelText('Filter by type')).toHaveValue('all')
    }, { timeout: 1000 })
  })

  it('displays active filters when search term or type is present', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')
    fireEvent.change(searchInput, { target: { value: 'char' } })

    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeInTheDocument()
      expect(screen.getByText('Name: "char"')).toBeInTheDocument()
    }, { timeout: 1000 })

    const typeFilter = screen.getByLabelText('Filter by type')
    fireEvent.change(typeFilter, { target: { value: 'fire' } })

    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeInTheDocument()
      expect(screen.getByText('Name: "char"')).toBeInTheDocument()
      expect(screen.getByText('Type: Fire')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows loading spinner when isSearching is true', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')

    // Trigger search input change
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // The spinner should be visible immediately after input change
    // We need to check for it right after the change, before the debounce timeout
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
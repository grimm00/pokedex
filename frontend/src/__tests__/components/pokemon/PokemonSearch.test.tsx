import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PokemonSearchMemo as PokemonSearch } from '@/components/pokemon/PokemonSearch'

// Mock the Zustand store
const mockGetPokemonTypes = vi.fn(() => Promise.resolve(['fire', 'water', 'grass']))
const mockOnSearch = vi.fn()
const mockOnClear = vi.fn()

vi.mock('@/store/pokemonStore', () => ({
  usePokemonStore: vi.fn(() => ({
    getPokemonTypes: mockGetPokemonTypes,
  })),
}))

describe('PokemonSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('calls onSearch when search input changes', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'char' } })
    })

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('char', 'all', 'id')
    })
  })

  it('calls onSearch when type filter changes', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument()
    })

    // Clear any initial calls
    mockOnSearch.mockClear()

    const typeFilter = screen.getByLabelText('Filter by type')

    await act(async () => {
      fireEvent.change(typeFilter, { target: { value: 'fire' } })
    })

    // Wait for the debounced effect to trigger (300ms + buffer)
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('', 'fire', 'id')
    }, { timeout: 1000 })
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
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('handles sort option changes', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    const sortSelect = screen.getByLabelText('Sort by')

    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: 'name' } })
    })

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('', 'all', 'name')
    })
  })

  it.skip('debounces search input changes', async () => {
    vi.useFakeTimers()

    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument()
    })

    // Clear any initial calls - this happens after the hasInitialized ref is set
    mockOnSearch.mockClear()

    const searchInput = screen.getByPlaceholderText('Enter Pokemon name...')

    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'c' } })
    fireEvent.change(searchInput, { target: { value: 'ch' } })
    fireEvent.change(searchInput, { target: { value: 'cha' } })
    fireEvent.change(searchInput, { target: { value: 'char' } })

    // Fast-forward timers to trigger debounce (300ms + buffer)
    act(() => {
      vi.advanceTimersByTime(400)
    })

    // Wait for the debounced call with a longer timeout
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('char', 'all', 'id')
    }, { timeout: 5000 })

    vi.useRealTimers()
  })
})
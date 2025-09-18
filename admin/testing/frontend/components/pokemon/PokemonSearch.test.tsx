import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PokemonSearch } from '@/components/pokemon/PokemonSearch'

// Mock the Pokemon store
const mockGetPokemonTypes = vi.fn()
const mockUsePokemonStore = vi.fn(() => ({
  getPokemonTypes: mockGetPokemonTypes,
}))

vi.mock('@/store/pokemonStore', () => ({
  usePokemonStore: mockUsePokemonStore,
}))

describe('PokemonSearch', () => {
  const mockOnSearch = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPokemonTypes.mockResolvedValue(['fire', 'water', 'grass', 'electric'])
  })

  it('renders search input and type filter', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument()
    expect(screen.getByText(/clear all filters/i)).toBeInTheDocument()
  })

  it('loads available types on mount', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    await waitFor(() => {
      expect(mockGetPokemonTypes).toHaveBeenCalled()
    })
  })

  it('displays available types in dropdown', async () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument()
      expect(screen.getByText('Water')).toBeInTheDocument()
      expect(screen.getByText('Grass')).toBeInTheDocument()
      expect(screen.getByText('Electric')).toBeInTheDocument()
    })
  })

  it('calls onSearch with debounced input', async () => {
    vi.useFakeTimers()
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    fireEvent.change(searchInput, { target: { value: 'char' } })
    
    // Fast-forward timers to trigger debounced search
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('char', 'all')
    })
    
    vi.useRealTimers()
  })

  it('calls onSearch when type filter changes', async () => {
    vi.useFakeTimers()
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const typeSelect = screen.getByLabelText(/filter by type/i)
    fireEvent.change(typeSelect, { target: { value: 'fire' } })
    
    // Fast-forward timers to trigger debounced search
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('', 'fire')
    })
    
    vi.useRealTimers()
  })

  it('calls onClear when clear button is clicked', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const clearButton = screen.getByText(/clear all filters/i)
    fireEvent.click(clearButton)
    
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('resets search term and type when clear is called', () => {
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    const typeSelect = screen.getByLabelText(/filter by type/i)
    
    // Set some values
    fireEvent.change(searchInput, { target: { value: 'char' } })
    fireEvent.change(typeSelect, { target: { value: 'fire' } })
    
    // Clear
    const clearButton = screen.getByText(/clear all filters/i)
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(typeSelect).toHaveValue('all')
  })

  it('shows search status when filters are active', async () => {
    vi.useFakeTimers()
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    const typeSelect = screen.getByLabelText(/filter by type/i)
    
    // Set search term
    fireEvent.change(searchInput, { target: { value: 'char' } })
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText(/active filters/i)).toBeInTheDocument()
      expect(screen.getByText(/name: "char"/i)).toBeInTheDocument()
    })
    
    // Set type filter
    fireEvent.change(typeSelect, { target: { value: 'fire' } })
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText(/type: fire/i)).toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })

  it('shows loading indicator during search', async () => {
    vi.useFakeTimers()
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const searchInput = screen.getByLabelText(/search by name/i)
    fireEvent.change(searchInput, { target: { value: 'char' } })
    
    // Check for loading spinner
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled()
    })
    
    vi.useRealTimers()
  })

  it('handles type loading errors gracefully', async () => {
    mockGetPokemonTypes.mockRejectedValue(new Error('Failed to load types'))
    
    render(<PokemonSearch onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    await waitFor(() => {
      // Should still render the component even if types fail to load
      expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument()
    })
  })
})

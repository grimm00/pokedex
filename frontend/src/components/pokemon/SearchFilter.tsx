import React, { useState, useCallback } from 'react'
import { POKEMON_TYPES } from '@/utils/constants'
import type { PokemonType } from '@/types'
import { useSearchQuery, useTypeFilter, usePokemonActions } from '@/hooks/useStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { debounce } from '@/utils/helpers'

interface SearchFilterProps {
  className?: string
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ className }) => {
  const searchQuery = useSearchQuery()
  const typeFilter = useTypeFilter()
  const { searchPokemon, filterByType, resetFilters } = usePokemonActions()

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchPokemon(query)
    }, 300),
    [searchPokemon]
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocalSearchQuery(query)
    debouncedSearch(query)
  }, [debouncedSearch])

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as PokemonType | 'all'
    filterByType(type)
  }, [filterByType])

  const handleReset = useCallback(() => {
    setLocalSearchQuery('')
    resetFilters()
  }, [resetFilters])

  return (
    <Card className={`p-6 mb-6 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Pokemon
          </label>
          <input
            id="search"
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Enter Pokemon name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        {/* Type Filter */}
        <div className="sm:w-48">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            id="type"
            value={typeFilter}
            onChange={handleTypeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="whitespace-nowrap"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  )
}

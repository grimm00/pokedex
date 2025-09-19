import React, { useState, useEffect, useRef, memo, useCallback } from 'react'
import { usePokemonStore } from '@/store/pokemonStore'
import { useAuthStore } from '@/store/authStore'

interface PokemonSearchProps {
    onSearch: (searchTerm: string, selectedType: string, sortBy?: string) => void
    onClear: () => void
}

const PokemonSearch: React.FC<PokemonSearchProps> = ({ onSearch, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [sortBy, setSortBy] = useState('id') // Matches backend default
    const [availableTypes, setAvailableTypes] = useState<string[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const { getPokemonTypes } = usePokemonStore()
    const { isAuthenticated } = useAuthStore()
    const onSearchRef = useRef(onSearch)
    const hasInitialized = useRef(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Keep the ref updated with the latest onSearch function
    useEffect(() => {
        onSearchRef.current = onSearch
    }, [onSearch])

    // Memoize the getPokemonTypes function to prevent infinite loops
    const memoizedGetPokemonTypes = useCallback(() => getPokemonTypes(), [getPokemonTypes])

    // Load available types on component mount
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await memoizedGetPokemonTypes()
                setAvailableTypes(types)
            } catch (error) {
                console.error('Failed to load Pokemon types:', error)
            }
        }
        loadTypes()
    }, [memoizedGetPokemonTypes])

    // Debounced search effect - trigger search after user stops typing
    useEffect(() => {
        // Skip the very first render to avoid duplicate initial load
        if (!hasInitialized.current) {
            hasInitialized.current = true
            return
        }

        // Only trigger search if there are meaningful parameters
        const trimmedSearch = searchTerm?.trim()
        const hasSearchTerm = trimmedSearch && trimmedSearch.length > 0
        const hasTypeFilter = selectedType !== 'all'
        const hasSort = sortBy && sortBy !== 'id'

        // Skip search if no meaningful parameters
        if (!hasSearchTerm && !hasTypeFilter && !hasSort) {
            return
        }

        // Show loading state briefly for visual feedback
        setIsSearching(true)

        // Debounce search to prevent excessive API calls and state conflicts
        const timeoutId = setTimeout(() => {
            onSearchRef.current(trimmedSearch || '', selectedType, sortBy)
            setIsSearching(false)
        }, 300) // Increased to 300ms to prevent excessive calls

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedType, sortBy]) // Remove onSearch from dependencies

    // Memoized event handlers to prevent unnecessary re-renders
    const handleClear = useCallback(() => {
        setSearchTerm('')
        setSelectedType('all')
        setSortBy('id') // Reset to backend default
        onClear()
    }, [onClear])

    const handleTypeChange = useCallback((type: string) => {
        setSelectedType(type)
    }, [])

    const handleSortChange = useCallback((sort: string) => {
        setSortBy(sort)
    }, [])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Sanitize input to prevent issues with special characters
        const sanitizedValue = value.replace(/[<>]/g, '')

        // Always update the search term immediately for responsive UI
        setSearchTerm(sanitizedValue)
    }, []) // Remove searchTerm dependency to prevent function recreation

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent form submission on Enter key
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }, [])

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Pokemon</h2>

            <div className="space-y-4">
                {/* Search Input */}
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                        Search by name
                    </label>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter Pokemon name..."
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            ) : (
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Type Filter */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by type
                    </label>
                    <select
                        id="type"
                        value={selectedType}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="all">All Types</option>
                        {availableTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort Options */}
                <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort by
                    </label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="id">Pokemon ID (Low to High)</option>
                        <option value="id_desc">Pokemon ID (High to Low)</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="height">Height (Short to Tall)</option>
                        <option value="height_desc">Height (Tall to Short)</option>
                        <option value="weight">Weight (Light to Heavy)</option>
                        <option value="weight_desc">Weight (Heavy to Light)</option>
                        {isAuthenticated && (
                            <option value="favorites">Favorites First</option>
                        )}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                        Clear All Filters
                    </button>
                </div>
            </div>

            {/* Search Status */}
            {(searchTerm || selectedType !== 'all') && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">Active filters:</span>
                        {searchTerm && <span className="ml-2">Name: "{searchTerm}"</span>}
                        {selectedType !== 'all' && (
                            <span className="ml-2">
                                Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </div>
    )
}

// Memoize the component to prevent unnecessary re-renders when parent updates
export const PokemonSearchMemo = memo(PokemonSearch)

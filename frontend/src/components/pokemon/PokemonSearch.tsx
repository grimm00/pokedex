import React, { useState, useEffect, useRef } from 'react'
import { usePokemonStore } from '@/store/pokemonStore'

interface PokemonSearchProps {
    onSearch: (searchTerm: string, selectedType: string) => void
    onClear: () => void
}

export const PokemonSearch: React.FC<PokemonSearchProps> = ({ onSearch, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [availableTypes, setAvailableTypes] = useState<string[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const { getPokemonTypes } = usePokemonStore()
    const onSearchRef = useRef(onSearch)
    
    // Keep the ref updated with the latest onSearch function
    useEffect(() => {
        onSearchRef.current = onSearch
    }, [onSearch])

    // Load available types on component mount
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await getPokemonTypes()
                setAvailableTypes(types)
            } catch (error) {
                console.error('Failed to load Pokemon types:', error)
            }
        }
        loadTypes()
    }, []) // Remove getPokemonTypes from dependencies to prevent infinite loop

    // Debounced search effect - only trigger when user actually types
    useEffect(() => {
        // Don't trigger search on initial mount when both are empty/default
        if (searchTerm === '' && selectedType === 'all') {
            return
        }

        const timeoutId = setTimeout(() => {
            setIsSearching(true)
            onSearchRef.current(searchTerm, selectedType) // Use ref to get latest function
            // Reset searching state after a short delay
            setTimeout(() => setIsSearching(false), 500)
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedType]) // Remove onSearch from dependencies

    const handleClear = () => {
        setSearchTerm('')
        setSelectedType('all')
        onClear()
    }

    const handleTypeChange = (type: string) => {
        setSelectedType(type)
    }

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
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

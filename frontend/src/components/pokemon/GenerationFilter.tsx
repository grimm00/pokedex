import React from 'react'

interface Generation {
    generation: number
    name: string
    region: string
    year: number
    pokemon_count: number
    expected_count: number
    color: string
    games: string[]
    description: string
    is_complete: boolean
}

interface GenerationFilterProps {
    selectedGeneration: number | 'all'
    onGenerationChange: (generation: number | 'all') => void
    generations: Generation[]
    isLoading?: boolean
}

const GenerationFilter: React.FC<GenerationFilterProps> = ({
    selectedGeneration,
    onGenerationChange,
    generations,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="generation-filter">
                <div className="filter-label mb-4 text-gray-700 font-medium">Filter by Generation:</div>
                <div className="generation-chips flex flex-wrap gap-2">
                    <div className="generation-chip-skeleton h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="generation-chip-skeleton h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="generation-chip-skeleton h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="generation-filter">
            <div className="filter-label mb-4 text-gray-700 font-medium">
                Filter by Generation:
            </div>

            <div className="generation-chips flex flex-wrap gap-3">
                {/* All Generations Option */}
                <button
                    className={`generation-chip ${selectedGeneration === 'all'
                            ? 'active bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-md'
                        } px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-w-[140px]`}
                    onClick={() => onGenerationChange('all')}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="hidden sm:inline">All Generations</span>
                        <span className="sm:hidden">All</span>
                    </span>
                </button>

                {/* Individual Generation Options */}
                {generations.map((gen) => (
                    <button
                        key={gen.generation}
                        className={`generation-chip ${selectedGeneration === gen.generation
                                ? 'active text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                            } px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 group`}
                        style={{
                            backgroundColor: selectedGeneration === gen.generation ? gen.color : undefined,
                            borderColor: selectedGeneration === gen.generation ? gen.color : undefined,
                            '--gen-color': gen.color
                        } as React.CSSProperties}
                        onClick={() => onGenerationChange(gen.generation)}
                        title={`${gen.description} (${gen.year})`}
                    >
                        <span className="flex items-center gap-2">
                            {/* Generation Icon */}
                            <div
                                className="w-3 h-3 rounded-full border-2 border-current"
                                style={{
                                    backgroundColor: selectedGeneration === gen.generation ? 'rgba(255,255,255,0.3)' : gen.color,
                                    borderColor: selectedGeneration === gen.generation ? 'white' : gen.color
                                }}
                            />

                            {/* Generation Info */}
                            <span className="flex flex-col items-start">
                                <span className="text-sm font-semibold">
                                    Gen {gen.generation}
                                </span>
                                <span className="text-xs opacity-80">
                                    {gen.name}
                                </span>
                            </span>

                            {/* Pokemon Count */}
                            <span className="text-xs bg-black bg-opacity-10 px-2 py-1 rounded-full">
                                {gen.pokemon_count}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Generation Info */}
            {selectedGeneration !== 'all' && (
                <div className="generation-info mt-4 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                        const selectedGen = generations.find(g => g.generation === selectedGeneration)
                        if (!selectedGen) return null

                        return (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: selectedGen.color }}
                                />
                                <div>
                                    <div className="font-medium text-gray-800">
                                        {selectedGen.name} Region (Gen {selectedGen.generation})
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {selectedGen.year} • {selectedGen.pokemon_count} Pokemon • {selectedGen.games.join(', ')}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}

export default GenerationFilter

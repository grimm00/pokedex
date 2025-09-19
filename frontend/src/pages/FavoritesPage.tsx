import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

export const FavoritesPage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthStore()
    const {
        favoritePokemon,
        loading,
        error,
        getFavorites,
        clearError
    } = useFavoritesStore()

    const [selectedPokemon, setSelectedPokemon] = React.useState<any>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth')
        }
    }, [isAuthenticated, navigate])

    // Load favorites when component mounts
    useEffect(() => {
        if (user && isAuthenticated) {
            getFavorites(user.id)
        }
    }, [user, isAuthenticated, getFavorites])

    const handlePokemonClick = (pokemon: any) => {
        setSelectedPokemon(pokemon)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedPokemon(null)
    }

    if (!isAuthenticated) {
        return null // Will redirect
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-center">
                    My Favorite Pokemon
                </h1>
                <button
                    onClick={() => navigate('/pokemon')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Browse All Pokemon
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : favoritePokemon.length > 0 ? (
                <>
                    <div className="text-center mb-6">
                        <p className="text-gray-600 text-lg">
                            You have {favoritePokemon.length} favorite Pokemon
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favoritePokemon.map((pokemon) => (
                            <PokemonCard
                                key={pokemon.pokemon_id}
                                pokemon={pokemon}
                                onSelect={handlePokemonClick}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">
                        No favorite Pokemon yet
                    </div>
                    <p className="text-gray-400 mb-6">
                        Start adding Pokemon to your favorites by clicking the heart icon on any Pokemon card
                    </p>
                    <button
                        onClick={() => navigate('/pokemon')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                        Browse Pokemon
                    </button>
                </div>
            )}

            {/* Modal */}
            <PokemonModal
                pokemon={selectedPokemon}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    )
}

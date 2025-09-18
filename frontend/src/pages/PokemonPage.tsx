import React, { useState, useEffect } from 'react'
import { PokemonCard } from '@/components/pokemon/PokemonCard'
import { PokemonModal } from '@/components/pokemon/PokemonModal'

// Mock Pokemon data for fallback
const mockPokemon = [
  {
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    height: 7,
    weight: 69,
    abilities: [{ name: 'overgrow' }, { name: 'chlorophyll' }],
    stats: [
      { name: 'hp', base_stat: 45 },
      { name: 'attack', base_stat: 49 },
      { name: 'defense', base_stat: 49 },
      { name: 'speed', base_stat: 45 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    }
  },
  {
    id: 2,
    name: 'ivysaur',
    types: ['grass', 'poison'],
    height: 10,
    weight: 130,
    abilities: [{ name: 'overgrow' }, { name: 'chlorophyll' }],
    stats: [
      { name: 'hp', base_stat: 60 },
      { name: 'attack', base_stat: 62 },
      { name: 'defense', base_stat: 63 },
      { name: 'speed', base_stat: 60 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png'
    }
  },
  {
    id: 3,
    name: 'venusaur',
    types: ['grass', 'poison'],
    height: 20,
    weight: 1000,
    abilities: [{ name: 'overgrow' }, { name: 'chlorophyll' }],
    stats: [
      { name: 'hp', base_stat: 80 },
      { name: 'attack', base_stat: 82 },
      { name: 'defense', base_stat: 83 },
      { name: 'speed', base_stat: 80 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png'
    }
  },
  {
    id: 4,
    name: 'charmander',
    types: ['fire'],
    height: 6,
    weight: 85,
    abilities: [{ name: 'blaze' }, { name: 'solar-power' }],
    stats: [
      { name: 'hp', base_stat: 39 },
      { name: 'attack', base_stat: 52 },
      { name: 'defense', base_stat: 43 },
      { name: 'speed', base_stat: 65 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
    }
  },
  {
    id: 5,
    name: 'charmeleon',
    types: ['fire'],
    height: 11,
    weight: 190,
    abilities: [{ name: 'blaze' }, { name: 'solar-power' }],
    stats: [
      { name: 'hp', base_stat: 58 },
      { name: 'attack', base_stat: 64 },
      { name: 'defense', base_stat: 58 },
      { name: 'speed', base_stat: 80 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png'
    }
  },
  {
    id: 6,
    name: 'charizard',
    types: ['fire', 'flying'],
    height: 17,
    weight: 905,
    abilities: [{ name: 'blaze' }, { name: 'solar-power' }],
    stats: [
      { name: 'hp', base_stat: 78 },
      { name: 'attack', base_stat: 84 },
      { name: 'defense', base_stat: 78 },
      { name: 'speed', base_stat: 100 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
    }
  },
  {
    id: 7,
    name: 'squirtle',
    types: ['water'],
    height: 5,
    weight: 90,
    abilities: [{ name: 'torrent' }, { name: 'rain-dish' }],
    stats: [
      { name: 'hp', base_stat: 44 },
      { name: 'attack', base_stat: 48 },
      { name: 'defense', base_stat: 65 },
      { name: 'speed', base_stat: 43 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
    }
  },
  {
    id: 8,
    name: 'wartortle',
    types: ['water'],
    height: 10,
    weight: 225,
    abilities: [{ name: 'torrent' }, { name: 'rain-dish' }],
    stats: [
      { name: 'hp', base_stat: 59 },
      { name: 'attack', base_stat: 63 },
      { name: 'defense', base_stat: 80 },
      { name: 'speed', base_stat: 58 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png'
    }
  },
  {
    id: 9,
    name: 'blastoise',
    types: ['water'],
    height: 16,
    weight: 855,
    abilities: [{ name: 'torrent' }, { name: 'rain-dish' }],
    stats: [
      { name: 'hp', base_stat: 79 },
      { name: 'attack', base_stat: 83 },
      { name: 'defense', base_stat: 100 },
      { name: 'speed', base_stat: 78 }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png'
    }
  }
]

export const PokemonPage: React.FC = () => {
  console.log('PokemonPage rendering...')
  const pokemon = mockPokemon // Use mock data directly
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  console.log('Pokemon data:', pokemon)

  const handlePokemonClick = (selectedPokemon: any) => {
    console.log('Pokemon clicked:', selectedPokemon.name)
    setSelectedPokemon(selectedPokemon)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPokemon(null)
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Pokemon Collection
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pokemon.map((poke) => (
          <PokemonCard
            key={poke.id}
            pokemon={poke}
            onSelect={handlePokemonClick}
          />
        ))}
      </div>
      
      {/* Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

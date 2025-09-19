import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { PokemonCard } from '@/components/pokemon/PokemonCard'

// Mock Pokemon data
const mockPokemon = {
    id: 1,
    pokemon_id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    base_experience: 64,
    types: ['grass', 'poison'],
    abilities: ['overgrow', 'chlorophyll'],
    stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        'special-attack': 65,
        'special-defense': 65,
        speed: 45
    },
    sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    },
    created_at: '2024-12-19T00:00:00Z',
    updated_at: '2024-12-19T00:00:00Z'
}

describe('PokemonCard', () => {
    it('renders pokemon name correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)
        expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
    })

    it('renders pokemon types correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        // Check if both types are rendered
        expect(screen.getByText('grass')).toBeInTheDocument()
        expect(screen.getByText('poison')).toBeInTheDocument()
    })

    it('applies correct CSS classes to type badges', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        const grassBadge = screen.getByText('grass')
        const poisonBadge = screen.getByText('poison')

        expect(grassBadge).toHaveClass('type-badge', 'type-grass')
        expect(poisonBadge).toHaveClass('type-badge', 'type-poison')
    })

    it('renders pokemon stats correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        expect(screen.getByText('0.7m')).toBeInTheDocument() // height
        expect(screen.getByText('6.9kg')).toBeInTheDocument() // weight
    })

    it('renders pokemon image correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        const image = screen.getByAltText('Bulbasaur front view')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', mockPokemon.sprites.front_default)
    })

    it('calls onSelect when clicked', () => {
        const mockOnSelect = vi.fn()
        render(<PokemonCard pokemon={mockPokemon} onSelect={mockOnSelect} />)

        const card = screen.getByText('Bulbasaur').closest('div')
        card?.click()

        expect(mockOnSelect).toHaveBeenCalledWith(mockPokemon)
    })
})

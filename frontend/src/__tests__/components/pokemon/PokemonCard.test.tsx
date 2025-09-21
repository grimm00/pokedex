import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
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
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
        front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png',
        back_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png'
    },
    created_at: '2024-12-19T00:00:00Z',
    updated_at: '2024-12-19T00:00:00Z'
}

const mockPokemonWithSingleType = {
    ...mockPokemon,
    id: 25,
    pokemon_id: 25,
    name: 'pikachu',
    types: ['electric']
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

    it('renders single type correctly', () => {
        render(<PokemonCard pokemon={mockPokemonWithSingleType} />)
        expect(screen.getByText('electric')).toBeInTheDocument()
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

    it('does not call onSelect when not provided', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        const card = screen.getByText('Bulbasaur').closest('div')
        expect(() => card?.click()).not.toThrow()
    })

    it('renders pokemon stats correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)
        expect(screen.getByText('0.7m')).toBeInTheDocument() // height
        expect(screen.getByText('6.9kg')).toBeInTheDocument() // weight
    })

    it('handles missing sprites gracefully', () => {
        const pokemonWithoutSprites = {
            ...mockPokemon,
            sprites: {
                front_default: null,
                back_default: null,
                front_shiny: null,
                back_shiny: null
            }
        }

        render(<PokemonCard pokemon={pokemonWithoutSprites} />)

        // Should still render the card without crashing
        expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
    })

    it('applies hover effects correctly', () => {
        render(<PokemonCard pokemon={mockPokemon} />)

        const card = screen.getByText('Bulbasaur').closest('div')
        expect(card).toHaveClass('hover:scale-105')
    })

    it('renders with different pokemon data', () => {
        const differentPokemon = {
            ...mockPokemon,
            id: 150,
            pokemon_id: 150,
            name: 'mewtwo',
            height: 20,
            weight: 1220,
            types: ['psychic']
        }

        render(<PokemonCard pokemon={differentPokemon} />)

        expect(screen.getByText('Mewtwo')).toBeInTheDocument()
        expect(screen.getByText('2m')).toBeInTheDocument()
        expect(screen.getByText('122kg')).toBeInTheDocument()
        expect(screen.getByText('psychic')).toBeInTheDocument()
    })
})
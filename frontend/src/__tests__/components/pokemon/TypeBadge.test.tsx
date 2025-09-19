import React from 'react'
import { render, screen } from '@testing-library/react'
import { TypeBadge } from '@/components/pokemon/TypeBadge'

describe('TypeBadge', () => {
    it('renders the type name correctly', () => {
        render(<TypeBadge type="fire" />)
        expect(screen.getByText('fire')).toBeInTheDocument()
    })

    it('applies correct CSS classes', () => {
        render(<TypeBadge type="water" />)
        const badge = screen.getByTestId('type-badge-water')
        expect(badge).toHaveClass('type-badge', 'type-water')
    })

    it('applies custom className', () => {
        render(<TypeBadge type="grass" className="custom-class" />)
        const badge = screen.getByTestId('type-badge-grass')
        expect(badge).toHaveClass('type-badge', 'type-grass', 'custom-class')
    })

    it('handles different Pokemon types', () => {
        const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'poison']

        types.forEach(type => {
            const { unmount } = render(<TypeBadge type={type} />)
            expect(screen.getByText(type)).toBeInTheDocument()
            expect(screen.getByTestId(`type-badge-${type}`)).toHaveClass(`type-${type}`)
            unmount()
        })
    })
})

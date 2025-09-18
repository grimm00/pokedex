import React from 'react'

interface TypeBadgeProps {
    type: string
    className?: string
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className = '' }) => {
    return (
        <span
            className={`type-badge type-${type} ${className}`}
            data-testid={`type-badge-${type}`}
        >
            {type}
        </span>
    )
}

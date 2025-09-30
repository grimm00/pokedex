import React from 'react'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'card' | 'text' | 'image' | 'button'
  lines?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'card',
  lines = 1 
}) => {
  const baseClasses = 'skeleton rounded'
  
  const variants = {
    card: 'h-80 w-full',
    text: 'h-4 w-full',
    image: 'h-32 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variants.text} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  )
}

// Pokemon Card Skeleton
export const PokemonCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="relative mb-4 h-32 flex items-center justify-center">
        <SkeletonLoader variant="image" className="h-full w-full" />
      </div>
      
      {/* Name skeleton */}
      <div className="mb-4">
        <SkeletonLoader variant="text" className="h-6 w-3/4 mx-auto" />
      </div>
      
      {/* Types skeleton */}
      <div className="flex gap-2 justify-center mb-4">
        <SkeletonLoader variant="button" className="h-6 w-16" />
        <SkeletonLoader variant="button" className="h-6 w-16" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center">
          <SkeletonLoader variant="text" className="h-3 w-12 mx-auto mb-1" />
          <SkeletonLoader variant="text" className="h-4 w-8 mx-auto" />
        </div>
        <div className="text-center">
          <SkeletonLoader variant="text" className="h-3 w-12 mx-auto mb-1" />
          <SkeletonLoader variant="text" className="h-4 w-8 mx-auto" />
        </div>
      </div>
      
      {/* Button skeleton */}
      <SkeletonLoader variant="button" className="h-10 w-full" />
    </div>
  )
}

// Pokemon Grid Skeleton
export const PokemonGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PokemonCardSkeleton key={index} />
      ))}
    </div>
  )
}

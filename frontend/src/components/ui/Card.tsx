import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pokemon' | 'elevated'
  hover?: boolean
}

const getVariantClasses = (variant: CardProps['variant']) => {
  const variants = {
    default: 'bg-white rounded-lg shadow-md',
    pokemon: 'bg-white rounded-xl shadow-pokemon hover:shadow-pokemon-lg transition-all duration-300',
    elevated: 'bg-white rounded-lg shadow-lg',
  }
  return variants[variant || 'default']
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          getVariantClasses(variant),
          hover && 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('px-6 py-4 border-b border-gray-200', className)}
        {...props}
      />
    )
  }
)

CardHeader.displayName = 'CardHeader'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('px-6 py-4', className)}
        {...props}
      />
    )
  }
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('px-6 py-4 border-t border-gray-200', className)}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'


# Tailwind CSS Syntax Guide

## Overview
This guide explains Tailwind CSS implementation for the Pokedex frontend. Tailwind is our utility-first CSS framework that provides a comprehensive set of utility classes for rapid UI development.

## File Structure
```
frontend/
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── src/
│   ├── styles/
│   │   ├── globals.css      # Global styles and Tailwind imports
│   │   └── components.css   # Component-specific styles
│   └── components/
│       ├── ui/              # Base UI components
│       └── pokemon/         # Pokemon-specific components
```

## Key Concepts
- **Utility-First** - Small, single-purpose classes
- **Responsive Design** - Mobile-first approach
- **Component Classes** - Custom component styles
- **Theme Customization** - Extend default design system
- **Dark Mode** - Built-in dark mode support

## Learning Objectives
- Master utility class usage
- Understand responsive design patterns
- Learn component styling approaches
- Master theme customization
- Understand performance optimization

---

## 1. Configuration (`tailwind.config.js`)

### **File Purpose**
Configures Tailwind CSS with custom theme, plugins, and content paths.

### **Line-by-Line Breakdown**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pokemon type colors
        'fire': '#FF6B6B',
        'water': '#4ECDC4',
        'grass': '#45B7D1',
        'electric': '#FFE66D',
        'psychic': '#A8E6CF',
        'ice': '#B4F8C8',
        'dragon': '#FFB6C1',
        'dark': '#2C3E50',
        'fairy': '#FFB6C1',
        'normal': '#95A5A6',
        'fighting': '#E74C3C',
        'flying': '#85C1E9',
        'poison': '#9B59B6',
        'ground': '#D2B48C',
        'rock': '#A0522D',
        'bug': '#27AE60',
        'ghost': '#8E44AD',
        'steel': '#7F8C8D',
      },
      fontFamily: {
        'pokemon': ['Pokemon', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'pokemon': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'pokemon-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
```

**Lines 1-2: TypeScript Support**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
```
- **Purpose**: TypeScript intellisense for configuration
- **Why**: Better development experience with autocomplete
- **Learning**: Tailwind supports TypeScript configuration

**Lines 3-6: Content Configuration**
```javascript
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
```
- **Purpose**: Tell Tailwind where to look for classes
- **Files**: HTML and all JavaScript/TypeScript files
- **Learning**: Tailwind only includes used classes in final CSS

**Lines 7-8: Theme Extension**
```javascript
  theme: {
    extend: {
```
- **Purpose**: Extend default theme without overriding
- **Why**: Keep default values while adding custom ones
- **Learning**: `extend` preserves existing theme values

**Lines 9-25: Pokemon Type Colors**
```javascript
      colors: {
        'fire': '#FF6B6B',
        'water': '#4ECDC4',
        'grass': '#45B7D1',
        // ... other types
      },
```
- **Purpose**: Custom colors for Pokemon types
- **Usage**: `bg-fire`, `text-water`, `border-grass`
- **Learning**: Custom colors integrate with all color utilities

**Lines 26-28: Custom Fonts**
```javascript
      fontFamily: {
        'pokemon': ['Pokemon', 'sans-serif'],
      },
```
- **Purpose**: Custom font family for Pokemon theme
- **Usage**: `font-pokemon`
- **Learning**: Font stacks with fallbacks

**Lines 29-34: Custom Animations**
```javascript
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
```
- **Purpose**: Custom animations for Pokemon effects
- **Usage**: `animate-float`, `animate-glow`
- **Learning**: Extend default animations with custom ones

**Lines 35-45: Keyframes**
```javascript
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
```
- **Purpose**: Define custom animation keyframes
- **Float**: Gentle up-down movement
- **Glow**: Pulsing glow effect
- **Learning**: CSS keyframes in JavaScript configuration

---

## 2. Global Styles (`globals.css`)

### **File Purpose**
Imports Tailwind directives and defines global styles.

### **Implementation**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 font-sans;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-pokemon font-bold;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
  }
  
  .pokemon-card {
    @apply bg-white rounded-xl shadow-pokemon p-6 transition-all duration-300 hover:shadow-pokemon-lg hover:-translate-y-1;
  }
  
  .pokemon-card:hover {
    @apply transform;
  }
  
  .type-badge {
    @apply px-3 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide;
  }
  
  .type-fire {
    @apply bg-fire;
  }
  
  .type-water {
    @apply bg-water;
  }
  
  .type-grass {
    @apply bg-grass;
  }
  
  /* Add all Pokemon types */
  .type-electric { @apply bg-electric; }
  .type-psychic { @apply bg-psychic; }
  .type-ice { @apply bg-ice; }
  .type-dragon { @apply bg-dragon; }
  .type-dark { @apply bg-dark; }
  .type-fairy { @apply bg-fairy; }
  .type-normal { @apply bg-normal; }
  .type-fighting { @apply bg-fighting; }
  .type-flying { @apply bg-flying; }
  .type-poison { @apply bg-poison; }
  .type-ground { @apply bg-ground; }
  .type-rock { @apply bg-rock; }
  .type-bug { @apply bg-bug; }
  .type-ghost { @apply bg-ghost; }
  .type-steel { @apply bg-steel; }
}

@layer utilities {
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .backdrop-blur-xs {
    backdrop-filter: blur(2px);
  }
}
```

**Lines 1-3: Tailwind Directives**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- **base**: Reset styles and base element styles
- **components**: Component-level styles
- **utilities**: Utility classes
- **Learning**: Order matters for CSS specificity

**Lines 5-15: Base Layer**
```css
@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 font-sans;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-pokemon font-bold;
  }
}
```
- **Purpose**: Global element styles
- **scroll-smooth**: Smooth scrolling behavior
- **font-pokemon**: Custom font for headings
- **Learning**: `@layer` organizes CSS by purpose

**Lines 17-25: Component Layer**
```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
```
- **Purpose**: Reusable component styles
- **btn**: Base button styles
- **btn-primary**: Primary button variant
- **Learning**: Component classes for consistency

**Lines 27-35: Pokemon Card Styles**
```css
  .pokemon-card {
    @apply bg-white rounded-xl shadow-pokemon p-6 transition-all duration-300 hover:shadow-pokemon-lg hover:-translate-y-1;
  }
  
  .pokemon-card:hover {
    @apply transform;
  }
```
- **Purpose**: Pokemon card component styles
- **Hover effects**: Lift and shadow on hover
- **Learning**: Interactive component styling

**Lines 37-60: Type Badge Styles**
```css
  .type-badge {
    @apply px-3 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide;
  }
  
  .type-fire {
    @apply bg-fire;
  }
```
- **Purpose**: Pokemon type indicator badges
- **Consistent styling**: All types use same base styles
- **Learning**: Systematic approach to variants

---

## 3. Component Usage Examples

### **Pokemon Card Component**

```typescript
import React from 'react'
import { Pokemon } from '@/types/pokemon'

interface PokemonCardProps {
  pokemon: Pokemon
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onClick?: () => void
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isFavorite = false,
  onToggleFavorite,
  onClick
}) => {
  const primaryType = pokemon.types[0]
  
  return (
    <div 
      className="pokemon-card cursor-pointer group"
      onClick={onClick}
    >
      {/* Pokemon Image */}
      <div className="relative mb-4">
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-full h-32 object-contain group-hover:animate-float"
        />
        {isFavorite && (
          <div className="absolute top-2 right-2 text-red-500 text-xl">
            ❤️
          </div>
        )}
      </div>
      
      {/* Pokemon Name */}
      <h3 className="text-lg font-pokemon font-bold text-center mb-2 capitalize group-hover:text-shadow">
        {pokemon.name}
      </h3>
      
      {/* Pokemon Types */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`type-badge type-${type} group-hover:animate-glow`}
          >
            {type}
          </span>
        ))}
      </div>
      
      {/* Pokemon Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center">
          <span className="text-gray-500">Height</span>
          <div className="font-semibold">{pokemon.height / 10}m</div>
        </div>
        <div className="text-center">
          <span className="text-gray-500">Weight</span>
          <div className="font-semibold">{pokemon.weight / 10}kg</div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.()
          }}
          className={`btn flex-1 ${
            isFavorite 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'btn-secondary'
          }`}
        >
          {isFavorite ? 'Remove' : 'Add'} Favorite
        </button>
      </div>
    </div>
  )
}
```

**Key Tailwind Classes Used:**
- **Layout**: `w-full`, `h-32`, `flex`, `grid`, `gap-2`
- **Spacing**: `mb-4`, `mt-4`, `p-6`, `px-3`, `py-1`
- **Colors**: `bg-white`, `text-gray-500`, `text-red-500`
- **Typography**: `text-lg`, `font-bold`, `text-center`, `capitalize`
- **Effects**: `hover:`, `group-hover:`, `animate-float`, `animate-glow`
- **Responsive**: `grid-cols-2`, `flex-wrap`

### **Pokemon List Component**

```typescript
import React from 'react'
import { Pokemon } from '@/types/pokemon'
import { PokemonCard } from './PokemonCard'

interface PokemonListProps {
  pokemon: Pokemon[]
  loading?: boolean
  onPokemonClick?: (pokemon: Pokemon) => void
  onToggleFavorite?: (pokemon: Pokemon) => void
  favorites?: Set<number>
}

export const PokemonList: React.FC<PokemonListProps> = ({
  pokemon,
  loading = false,
  onPokemonClick,
  onToggleFavorite,
  favorites = new Set()
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-pokemon font-bold text-gray-600 mb-2">
          No Pokemon Found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {pokemon.map((p) => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          isFavorite={favorites.has(p.id)}
          onClick={() => onPokemonClick?.(p)}
          onToggleFavorite={() => onToggleFavorite?.(p)}
        />
      ))}
    </div>
  )
}
```

**Responsive Grid Classes:**
- **Mobile**: `grid-cols-1` (1 column)
- **Small**: `sm:grid-cols-2` (2 columns)
- **Medium**: `md:grid-cols-3` (3 columns)
- **Large**: `lg:grid-cols-4` (4 columns)
- **Extra Large**: `xl:grid-cols-5` (5 columns)

### **Search and Filter Component**

```typescript
import React from 'react'
import { PokemonType } from '@/types/pokemon'

interface SearchFilterProps {
  searchQuery: string
  typeFilter: PokemonType | 'all'
  onSearchChange: (query: string) => void
  onTypeChange: (type: PokemonType | 'all') => void
  onReset: () => void
}

const POKEMON_TYPES: (PokemonType | 'all')[] = [
  'all', 'fire', 'water', 'grass', 'electric', 'psychic',
  'ice', 'dragon', 'dark', 'fairy', 'normal', 'fighting',
  'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel'
]

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  typeFilter,
  onSearchChange,
  onTypeChange,
  onReset
}) => {
  return (
    <div className="bg-white rounded-xl shadow-pokemon p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Pokemon
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Enter Pokemon name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        {/* Type Filter */}
        <div className="sm:w-48">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            id="type"
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as PokemonType | 'all')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="btn btn-secondary whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Responsive Design Patterns

### **Mobile-First Approach**

```typescript
// Mobile-first responsive design
<div className="
  flex flex-col          // Mobile: vertical layout
  sm:flex-row            // Small screens: horizontal layout
  md:space-x-4           // Medium screens: add horizontal spacing
  lg:space-x-8           // Large screens: more spacing
">
  <div className="
    w-full               // Mobile: full width
    sm:w-1/2             // Small screens: half width
    md:w-1/3             // Medium screens: third width
    lg:w-1/4             // Large screens: quarter width
  ">
    Content
  </div>
</div>
```

### **Breakpoint System**

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
}

// Usage examples
<div className="
  text-sm              // Base: small text
  sm:text-base         // Small+: base text
  md:text-lg           // Medium+: large text
  lg:text-xl           // Large+: extra large text
  xl:text-2xl          // XL+: 2X large text
">
  Responsive Text
</div>
```

---

## 5. Dark Mode Implementation

### **Configuration**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'primary': '#3B82F6',
        'secondary': '#6B7280',
        // Dark mode colors
        'dark-bg': '#1F2937',
        'dark-card': '#374151',
        'dark-text': '#F9FAFB',
      }
    }
  }
}
```

### **Component Usage**

```typescript
export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="
        p-2 rounded-lg
        bg-gray-200 dark:bg-gray-700
        text-gray-800 dark:text-gray-200
        hover:bg-gray-300 dark:hover:bg-gray-600
        transition-colors duration-200
      "
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

---

## Key Learning Points

### **1. Utility-First Approach**
- **Small classes**: Single-purpose utilities
- **Composition**: Combine utilities for complex designs
- **Consistency**: Standardized spacing, colors, typography

### **2. Responsive Design**
- **Mobile-first**: Start with mobile, enhance for larger screens
- **Breakpoints**: Use consistent breakpoint system
- **Progressive enhancement**: Add features for larger screens

### **3. Component Styling**
- **Base styles**: Use `@layer components` for reusable styles
- **Variants**: Create component variants with modifiers
- **States**: Handle hover, focus, active states

### **4. Performance**
- **Purge CSS**: Only include used classes in production
- **JIT**: Just-in-time compilation for faster builds
- **Optimization**: Minimize CSS bundle size

### **5. Customization**
- **Theme extension**: Add custom values without overriding
- **Plugin system**: Extend functionality with plugins
- **CSS layers**: Organize styles by purpose

---

## Common Patterns

### **Card Component**
```typescript
<div className="
  bg-white dark:bg-gray-800
  rounded-xl shadow-lg
  p-6
  hover:shadow-xl hover:-translate-y-1
  transition-all duration-300
">
  Card Content
</div>
```

### **Button Variants**
```typescript
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  ghost: 'text-blue-600 hover:bg-blue-100'
}
```

### **Form Inputs**
```typescript
<input className="
  w-full px-4 py-2
  border border-gray-300 rounded-lg
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  transition-colors duration-200
" />
```

---

## Troubleshooting

### **Common Issues**

**Classes Not Working**
- Check if class is in content paths
- Verify Tailwind is properly configured
- Check for typos in class names

**Responsive Not Working**
- Ensure mobile-first approach
- Check breakpoint order
- Verify viewport meta tag

**Custom Colors Not Available**
- Check theme configuration
- Restart development server
- Verify color name spelling

**Dark Mode Not Working**
- Check darkMode configuration
- Verify class is applied to html element
- Check for conflicting styles

---

## Related Documentation

- [Vite Setup Guide](vite-setup-syntax.md)
- [Zustand State Management](zustand-state-syntax.md)
- [React Components Guide](react-components-syntax.md)
- [Headless UI Guide](headless-ui-syntax.md)

This guide provides comprehensive understanding of Tailwind CSS for the Pokedex frontend project.


# Zustand State Management Syntax Guide

## Overview
This guide explains Zustand state management implementation for the Pokedex frontend. Zustand is our lightweight state management solution that provides a simple, TypeScript-first approach to managing application state.

## File Structure
```
frontend/src/
├── store/
│   ├── index.ts              # Store exports
│   ├── pokemonStore.ts       # Pokemon state management
│   ├── userStore.ts          # User authentication state
│   └── uiStore.ts            # UI state (modals, loading, etc.)
├── types/
│   ├── pokemon.ts            # Pokemon type definitions
│   └── user.ts               # User type definitions
└── hooks/
    └── useStore.ts           # Custom store hooks
```

## Key Concepts
- **Store** - Single source of truth for state
- **Actions** - Functions that update state
- **Selectors** - Functions that extract specific state
- **Subscriptions** - Automatic re-renders on state changes
- **Immer Integration** - Immutable state updates

## Learning Objectives
- Understand Zustand store creation
- Learn action patterns and async operations
- Master selector usage and performance
- Understand TypeScript integration
- Learn debugging and devtools

---

## 1. Basic Store Structure (`pokemonStore.ts`)

### **File Purpose**
Manages all Pokemon-related state including list, search, favorites, and loading states.

### **Line-by-Line Breakdown**

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Pokemon, PokemonType } from '@/types/pokemon'
import { pokemonApi } from '@/services/api'

interface PokemonState {
  // State properties
  pokemon: Pokemon[]
  filteredPokemon: Pokemon[]
  selectedPokemon: Pokemon | null
  favorites: Set<number>
  searchQuery: string
  typeFilter: PokemonType | 'all'
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
}

interface PokemonActions {
  // Action methods
  fetchPokemon: () => Promise<void>
  fetchPokemonById: (id: number) => Promise<void>
  searchPokemon: (query: string) => void
  filterByType: (type: PokemonType | 'all') => void
  addToFavorites: (pokemon: Pokemon) => void
  removeFromFavorites: (pokemonId: number) => void
  setSelectedPokemon: (pokemon: Pokemon | null) => void
  loadMore: () => Promise<void>
  resetFilters: () => void
  clearError: () => void
}

type PokemonStore = PokemonState & PokemonActions

export const usePokemonStore = create<PokemonStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      pokemon: [],
      filteredPokemon: [],
      selectedPokemon: null,
      favorites: new Set(),
      searchQuery: '',
      typeFilter: 'all',
      loading: false,
      error: null,
      page: 1,
      hasMore: true,

      // Actions
      fetchPokemon: async () => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await pokemonApi.getPokemon()
          set((state) => {
            state.pokemon = response.data
            state.filteredPokemon = response.data
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
            state.loading = false
          })
        }
      },

      fetchPokemonById: async (id: number) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await pokemonApi.getPokemonById(id)
          set((state) => {
            state.selectedPokemon = response.data
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
            state.loading = false
          })
        }
      },

      searchPokemon: (query: string) => {
        set((state) => {
          state.searchQuery = query
          state.filteredPokemon = state.pokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(query.toLowerCase())
          )
        })
      },

      filterByType: (type: PokemonType | 'all') => {
        set((state) => {
          state.typeFilter = type
          state.filteredPokemon = state.pokemon.filter(pokemon =>
            type === 'all' || pokemon.types.includes(type)
          )
        })
      },

      addToFavorites: (pokemon: Pokemon) => {
        set((state) => {
          state.favorites.add(pokemon.id)
        })
      },

      removeFromFavorites: (pokemonId: number) => {
        set((state) => {
          state.favorites.delete(pokemonId)
        })
      },

      setSelectedPokemon: (pokemon: Pokemon | null) => {
        set((state) => {
          state.selectedPokemon = pokemon
        })
      },

      loadMore: async () => {
        const { page, hasMore, loading } = get()
        if (!hasMore || loading) return

        set((state) => {
          state.loading = true
        })

        try {
          const response = await pokemonApi.getPokemon(page + 1)
          set((state) => {
            state.pokemon = [...state.pokemon, ...response.data]
            state.filteredPokemon = [...state.filteredPokemon, ...response.data]
            state.page = page + 1
            state.hasMore = response.data.length > 0
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load more Pokemon'
            state.loading = false
          })
        }
      },

      resetFilters: () => {
        set((state) => {
          state.searchQuery = ''
          state.typeFilter = 'all'
          state.filteredPokemon = state.pokemon
        })
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },
    })),
    { name: 'pokemon-store' }
  )
)
```

**Lines 1-4: Imports**
```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Pokemon, PokemonType } from '@/types/pokemon'
```
- **create**: Core Zustand function for creating stores
- **devtools**: Redux DevTools integration for debugging
- **immer**: Immutable state updates (no need for spread operators)
- **Types**: TypeScript interfaces for type safety

**Lines 6-20: State Interface**
```typescript
interface PokemonState {
  pokemon: Pokemon[]
  filteredPokemon: Pokemon[]
  selectedPokemon: Pokemon | null
  favorites: Set<number>
  searchQuery: string
  typeFilter: PokemonType | 'all'
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
}
```
- **pokemon**: Complete list from API
- **filteredPokemon**: Filtered/searched results
- **selectedPokemon**: Currently viewed Pokemon
- **favorites**: Set of favorite Pokemon IDs
- **searchQuery**: Current search term
- **typeFilter**: Active type filter
- **loading**: Loading state for async operations
- **error**: Error message if any
- **page**: Current pagination page
- **hasMore**: Whether more data is available

**Lines 22-35: Actions Interface**
```typescript
interface PokemonActions {
  fetchPokemon: () => Promise<void>
  fetchPokemonById: (id: number) => Promise<void>
  searchPokemon: (query: string) => void
  filterByType: (type: PokemonType | 'all') => void
  addToFavorites: (pokemon: Pokemon) => void
  removeFromFavorites: (pokemonId: number) => void
  setSelectedPokemon: (pokemon: Pokemon | null) => void
  loadMore: () => Promise<void>
  resetFilters: () => void
  clearError: () => void
}
```
- **Async actions**: Return Promise for async operations
- **Sync actions**: Direct state updates
- **Learning**: Separate state from actions for clarity

**Lines 37-38: Store Type**
```typescript
type PokemonStore = PokemonState & PokemonActions
```
- **Combines**: State and actions into single type
- **Learning**: TypeScript intersection types

**Lines 40-42: Store Creation**
```typescript
export const usePokemonStore = create<PokemonStore>()(
  devtools(
    immer((set, get) => ({
```
- **create<PokemonStore>()**: Type-safe store creation
- **devtools**: Wraps store for debugging
- **immer**: Enables mutable-style updates
- **set**: Function to update state
- **get**: Function to read current state

**Lines 43-52: Initial State**
```typescript
      pokemon: [],
      filteredPokemon: [],
      selectedPokemon: null,
      favorites: new Set(),
      searchQuery: '',
      typeFilter: 'all',
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
```
- **Empty arrays**: Start with no data
- **Set for favorites**: Efficient lookup and uniqueness
- **Default filters**: Start with no filters applied
- **Loading states**: Start in non-loading state

**Lines 54-70: Async Action Example**
```typescript
      fetchPokemon: async () => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await pokemonApi.getPokemon()
          set((state) => {
            state.pokemon = response.data
            state.filteredPokemon = response.data
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
            state.loading = false
          })
        }
      },
```
- **Loading state**: Set loading to true before API call
- **Error handling**: Clear previous errors
- **Success**: Update state with API response
- **Error**: Set error message and stop loading
- **Learning**: Async actions follow this pattern

---

## 2. User Store (`userStore.ts`)

### **File Purpose**
Manages user authentication state and user-specific data.

### **Key Implementation**

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { User } from '@/types/user'
import { authApi } from '@/services/api'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface UserActions {
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  clearError: () => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await authApi.login(email, password)
          localStorage.setItem('token', response.data.access_token)
          set((state) => {
            state.user = response.data.user
            state.isAuthenticated = true
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Login failed'
            state.loading = false
          })
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set((state) => {
          state.user = null
          state.isAuthenticated = false
        })
      },

      // ... other actions
    })),
    { name: 'user-store' }
  )
)
```

**Key Learning Points:**
- **Authentication state**: Track login status
- **Token management**: Store JWT in localStorage
- **Error handling**: Consistent error patterns
- **Logout**: Clear all user data

---

## 3. UI Store (`uiStore.ts`)

### **File Purpose**
Manages UI state like modals, notifications, and loading states.

### **Key Implementation**

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  modals: {
    pokemonDetail: boolean
    login: boolean
    register: boolean
  }
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>
  sidebarOpen: boolean
  theme: 'light' | 'dark'
}

interface UIActions {
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  addNotification: (message: string, type: UIState['notifications'][0]['type']) => void
  removeNotification: (id: string) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      modals: {
        pokemonDetail: false,
        login: false,
        register: false,
      },
      notifications: [],
      sidebarOpen: false,
      theme: 'light',

      openModal: (modal) => {
        set((state) => {
          state.modals[modal] = true
        })
      },

      closeModal: (modal) => {
        set((state) => {
          state.modals[modal] = false
        })
      },

      addNotification: (message, type) => {
        const id = Math.random().toString(36).substr(2, 9)
        set((state) => {
          state.notifications.push({ id, message, type })
        })
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },

      // ... other actions
    })),
    { name: 'ui-store' }
  )
)
```

**Key Learning Points:**
- **Modal management**: Track which modals are open
- **Notifications**: Array of notification objects
- **Theme state**: Light/dark mode toggle
- **Auto-cleanup**: Notifications auto-remove

---

## 4. Custom Hooks (`useStore.ts`)

### **File Purpose**
Provides convenient hooks for accessing store state and actions.

### **Implementation**

```typescript
import { usePokemonStore } from '@/store/pokemonStore'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'

// Pokemon selectors
export const usePokemon = () => usePokemonStore((state) => state.pokemon)
export const useFilteredPokemon = () => usePokemonStore((state) => state.filteredPokemon)
export const useSelectedPokemon = () => usePokemonStore((state) => state.selectedPokemon)
export const useFavorites = () => usePokemonStore((state) => state.favorites)
export const usePokemonLoading = () => usePokemonStore((state) => state.loading)
export const usePokemonError = () => usePokemonStore((state) => state.error)

// Pokemon actions
export const usePokemonActions = () => usePokemonStore((state) => ({
  fetchPokemon: state.fetchPokemon,
  fetchPokemonById: state.fetchPokemonById,
  searchPokemon: state.searchPokemon,
  filterByType: state.filterByType,
  addToFavorites: state.addToFavorites,
  removeFromFavorites: state.removeFromFavorites,
  setSelectedPokemon: state.setSelectedPokemon,
  loadMore: state.loadMore,
  resetFilters: state.resetFilters,
  clearError: state.clearError,
}))

// User selectors
export const useUser = () => useUserStore((state) => state.user)
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated)
export const useUserLoading = () => useUserStore((state) => state.loading)

// User actions
export const useUserActions = () => useUserStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  refreshToken: state.refreshToken,
  clearError: state.clearError,
}))

// UI selectors
export const useModals = () => useUIStore((state) => state.modals)
export const useNotifications = () => useUIStore((state) => state.notifications)
export const useTheme = () => useUIStore((state) => state.theme)

// UI actions
export const useUIActions = () => useUIStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
}))
```

**Key Learning Points:**
- **Selectors**: Extract specific state pieces
- **Actions**: Group related actions together
- **Performance**: Only re-render when specific state changes
- **Convenience**: Easy-to-use hooks for components

---

## 5. Component Usage Examples

### **Pokemon List Component**

```typescript
import React, { useEffect } from 'react'
import { useFilteredPokemon, usePokemonLoading, usePokemonActions } from '@/hooks/useStore'

export const PokemonList: React.FC = () => {
  const pokemon = useFilteredPokemon()
  const loading = usePokemonLoading()
  const { fetchPokemon, searchPokemon, filterByType } = usePokemonActions()

  useEffect(() => {
    fetchPokemon()
  }, [fetchPokemon])

  if (loading) {
    return <div>Loading Pokemon...</div>
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search Pokemon..."
        onChange={(e) => searchPokemon(e.target.value)}
      />
      <select onChange={(e) => filterByType(e.target.value as PokemonType)}>
        <option value="all">All Types</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        {/* ... other types */}
      </select>
      <div className="pokemon-grid">
        {pokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  )
}
```

### **Pokemon Card Component**

```typescript
import React from 'react'
import { useFavorites, usePokemonActions } from '@/hooks/useStore'
import { Pokemon } from '@/types/pokemon'

interface PokemonCardProps {
  pokemon: Pokemon
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  const favorites = useFavorites()
  const { addToFavorites, removeFromFavorites, setSelectedPokemon } = usePokemonActions()
  
  const isFavorite = favorites.has(pokemon.id)
  
  const handleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(pokemon.id)
    } else {
      addToFavorites(pokemon)
    }
  }

  return (
    <div className="pokemon-card">
      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      <h3>{pokemon.name}</h3>
      <div className="types">
        {pokemon.types.map(type => (
          <span key={type} className={`type type-${type}`}>
            {type}
          </span>
        ))}
      </div>
      <button onClick={handleFavorite}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
      <button onClick={() => setSelectedPokemon(pokemon)}>
        View Details
      </button>
    </div>
  )
}
```

---

## Key Learning Points

### **1. Store Structure**
- **State**: Data that components need
- **Actions**: Functions that update state
- **TypeScript**: Full type safety throughout

### **2. Immer Integration**
- **Mutable updates**: Write code as if state is mutable
- **Immutable results**: Zustand ensures immutability
- **Learning**: No need for spread operators or deep cloning

### **3. Middleware Usage**
- **devtools**: Redux DevTools integration
- **immer**: Immutable state updates
- **Learning**: Middleware extends Zustand functionality

### **4. Selector Pattern**
- **Performance**: Only re-render when specific state changes
- **Convenience**: Easy-to-use hooks
- **Learning**: Avoid unnecessary re-renders

### **5. Async Actions**
- **Loading states**: Track async operation status
- **Error handling**: Consistent error management
- **Learning**: Async operations need special handling

---

## Common Patterns

### **State Updates with Immer**
```typescript
// Instead of spread operators
set((state) => ({
  ...state,
  pokemon: [...state.pokemon, newPokemon]
}))

// Use Immer (mutable style)
set((state) => {
  state.pokemon.push(newPokemon)
})
```

### **Error Handling**
```typescript
try {
  const response = await api.getData()
  set((state) => {
    state.data = response.data
    state.loading = false
  })
} catch (error) {
  set((state) => {
    state.error = error.message
    state.loading = false
  })
}
```

### **Conditional Updates**
```typescript
set((state) => {
  if (state.favorites.has(pokemonId)) {
    state.favorites.delete(pokemonId)
  } else {
    state.favorites.add(pokemonId)
  }
})
```

---

## Troubleshooting

### **Common Issues**

**Store Not Updating**
- Check if component is subscribed to store
- Verify action is being called
- Check for TypeScript errors

**Infinite Re-renders**
- Avoid creating new objects in selectors
- Use useCallback for action functions
- Check dependency arrays

**TypeScript Errors**
- Ensure proper type definitions
- Check store type combinations
- Verify action signatures

---

## Related Documentation

- [Vite Setup Guide](vite-setup-syntax.md)
- [React Components Guide](react-components-syntax.md)
- [TypeScript Configuration](typescript-syntax.md)
- [API Integration Guide](api-integration-syntax.md)

This guide provides comprehensive understanding of Zustand state management for the Pokedex frontend project.


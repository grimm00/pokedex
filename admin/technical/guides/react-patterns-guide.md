# React Patterns Guide

## Overview
This guide covers advanced React patterns and best practices used in the Pokedex frontend. It focuses on modern React 18 features, TypeScript integration, and performance optimization techniques.

## Table of Contents
1. [Modern React Patterns](#modern-react-patterns)
2. [TypeScript Integration](#typescript-integration)
3. [Performance Patterns](#performance-patterns)
4. [State Management Patterns](#state-management-patterns)
5. [Component Composition](#component-composition)
6. [Custom Hooks](#custom-hooks)
7. [Error Handling](#error-handling)
8. [Testing Patterns](#testing-patterns)
9. [Accessibility Patterns](#accessibility-patterns)
10. [Advanced Patterns](#advanced-patterns)

---

## Modern React Patterns

### **1. Functional Components with Hooks**

```typescript
// Modern functional component
interface PokemonCardProps {
  pokemon: Pokemon
  onSelect: (pokemon: Pokemon) => void
  isFavorite: boolean
  onToggleFavorite: (pokemon: Pokemon) => void
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onSelect,
  isFavorite,
  onToggleFavorite
}) => {
  // Local state for UI interactions
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Event handlers
  const handleClick = useCallback(() => {
    onSelect(pokemon)
  }, [onSelect, pokemon])

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(pokemon)
  }, [onToggleFavorite, pokemon])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  // Computed values
  const primaryType = pokemon.types[0]
  const fallbackImage = '/images/pokemon-placeholder.png'

  return (
    <div
      className={`
        pokemon-card
        ${isHovered ? 'hovered' : ''}
        ${isFavorite ? 'favorite' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component JSX */}
    </div>
  )
}
```

**Key Patterns:**
- **useCallback**: Memoize event handlers to prevent unnecessary re-renders
- **useState**: Local state for UI interactions
- **Computed values**: Derive values from props/state
- **Event handling**: Proper event propagation control

### **2. React 18 Concurrent Features**

```typescript
// Using Suspense for data fetching
const PokemonList = () => {
  return (
    <Suspense fallback={<PokemonListSkeleton />}>
      <PokemonListContent />
    </Suspense>
  )
}

// Using startTransition for non-urgent updates
const SearchInput = () => {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // Urgent update
    startTransition(() => {
      // Non-urgent update
      setSearchResults(performSearch(value))
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && <SearchSpinner />}
    </div>
  )
}
```

### **3. Error Boundaries**

```typescript
// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class PokemonErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Pokemon Error Boundary:', error, errorInfo)
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with Pokemon data</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
<PokemonErrorBoundary>
  <PokemonList />
</PokemonErrorBoundary>
```

---

## TypeScript Integration

### **1. Component Props Typing**

```typescript
// Generic component props
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
  loading?: boolean
  onLoadMore?: () => void
}

export const List = <T,>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
  loading = false,
  onLoadMore
}: ListProps<T>) => {
  // Component implementation
}

// Usage with type inference
<List
  items={pokemon}
  renderItem={(pokemon) => <PokemonCard pokemon={pokemon} />}
  keyExtractor={(pokemon) => pokemon.id}
/>
```

### **2. Event Handler Typing**

```typescript
// Properly typed event handlers
interface FormProps {
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

const PokemonForm: React.FC<FormProps> = ({ onSubmit, onCancel }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle input change
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Handle enter key
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
```

### **3. Ref Typing**

```typescript
// Ref typing for DOM elements
const SearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const clearInput = useCallback(() => {
    setQuery('')
    inputRef.current?.focus()
  }, [])

  return (
    <div>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={clearInput}>Clear</button>
    </div>
  )
}

// Ref typing for custom components
interface PokemonCardRef {
  focus: () => void
  scrollIntoView: () => void
}

const PokemonCard = forwardRef<PokemonCardRef, PokemonCardProps>(
  ({ pokemon, onSelect }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => cardRef.current?.focus(),
      scrollIntoView: () => cardRef.current?.scrollIntoView()
    }))

    return (
      <div ref={cardRef} onClick={() => onSelect(pokemon)}>
        {/* Card content */}
      </div>
    )
  }
)
```

---

## Performance Patterns

### **1. Memoization Patterns**

```typescript
// Memoizing expensive calculations
const PokemonList = ({ pokemon, searchQuery, typeFilter }: Props) => {
  const filteredPokemon = useMemo(() => {
    return pokemon.filter(pokemon => {
      const matchesSearch = pokemon.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || 
        pokemon.types.includes(typeFilter)
      return matchesSearch && matchesType
    })
  }, [pokemon, searchQuery, typeFilter])

  const sortedPokemon = useMemo(() => {
    return [...filteredPokemon].sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredPokemon])

  return (
    <div>
      {sortedPokemon.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  )
}

// Memoizing components
const PokemonCard = React.memo<PokemonCardProps>(({
  pokemon,
  onSelect,
  isFavorite,
  onToggleFavorite
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.pokemon.id === nextProps.pokemon.id &&
    prevProps.isFavorite === nextProps.isFavorite
  )
})
```

### **2. Lazy Loading Patterns**

```typescript
// Route-based lazy loading
const HomePage = lazy(() => import('./pages/HomePage'))
const PokemonPage = lazy(() => import('./pages/PokemonPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon" element={<PokemonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

// Component-based lazy loading
const PokemonDetail = lazy(() => import('./PokemonDetail'))

const PokemonList = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)

  return (
    <div>
      {/* Pokemon list */}
      {selectedPokemon && (
        <Suspense fallback={<DetailSkeleton />}>
          <PokemonDetail pokemon={selectedPokemon} />
        </Suspense>
      )}
    </div>
  )
}
```

### **3. Virtual Scrolling**

```typescript
import { FixedSizeList as List } from 'react-window'

interface VirtualizedPokemonListProps {
  pokemon: Pokemon[]
  height: number
  itemHeight: number
}

const VirtualizedPokemonList: React.FC<VirtualizedPokemonListProps> = ({
  pokemon,
  height,
  itemHeight
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PokemonCard pokemon={pokemon[index]} />
    </div>
  )

  return (
    <List
      height={height}
      itemCount={pokemon.length}
      itemSize={itemHeight}
      itemData={pokemon}
    >
      {Row}
    </List>
  )
}
```

---

## State Management Patterns

### **1. Local State Management**

```typescript
// Form state management
const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    reset
  }
}

// Usage
const LoginForm = () => {
  const { values, errors, setValue, setFieldTouched } = useForm({
    email: '',
    password: ''
  })

  return (
    <form>
      <input
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        onBlur={() => setFieldTouched('email')}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  )
}
```

### **2. Context Pattern**

```typescript
// Theme context
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

---

## Component Composition

### **1. Compound Components**

```typescript
// Modal compound component
interface ModalContextType {
  isOpen: boolean
  close: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  return (
    <ModalContext.Provider value={{ isOpen, close: onClose }}>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {children}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}

const ModalHeader = ({ children }: { children: React.ReactNode }) => {
  const { close } = useModal()
  return (
    <div className="modal-header">
      {children}
      <button onClick={close}>×</button>
    </div>
  )
}

const ModalBody = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-body">{children}</div>
)

const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-footer">{children}</div>
)

// Usage
<Modal isOpen={isOpen} onClose={closeModal}>
  <ModalHeader>
    <h2>Pokemon Details</h2>
  </ModalHeader>
  <ModalBody>
    <PokemonDetail pokemon={selectedPokemon} />
  </ModalBody>
  <ModalFooter>
    <button onClick={closeModal}>Close</button>
  </ModalFooter>
</Modal>
```

### **2. Render Props Pattern**

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
  }) => React.ReactNode
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return <>{children({ data, loading, error, refetch: fetchData })}</>
}

// Usage
<DataFetcher<Pokemon[]> url="/api/pokemon">
  {({ data, loading, error, refetch }) => {
    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} onRetry={refetch} />
    return <PokemonList pokemon={data || []} />
  }}
</DataFetcher>
```

---

## Custom Hooks

### **1. Data Fetching Hook**

```typescript
interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

const useApi = <T>(
  url: string,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { immediate = true, onSuccess, onError } = options

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error.message)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute }
}

// Usage
const PokemonList = () => {
  const { data: pokemon, loading, error, execute } = useApi<Pokemon[]>('/api/pokemon')

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={execute} />
  return <PokemonList pokemon={pokemon || []} />
}
```

### **2. Local Storage Hook**

```typescript
const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// Usage
const PokemonFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<number[]>('pokemon-favorites', [])

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavorites(prev => 
      prev.includes(pokemonId)
        ? prev.filter(id => id !== pokemonId)
        : [...prev, pokemonId]
    )
  }, [setFavorites])

  return (
    <div>
      {favorites.map(id => (
        <PokemonCard key={id} pokemonId={id} />
      ))}
    </div>
  )
}
```

---

## Error Handling

### **1. Error Boundary with Retry**

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

class PokemonErrorBoundary extends React.Component<
  React.PropsWithChildren<{ maxRetries?: number }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ maxRetries?: number }>) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Pokemon Error Boundary:', error, errorInfo)
    // Log to error reporting service
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    if (this.state.retryCount < maxRetries) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1
      }))
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          {this.state.retryCount < (this.props.maxRetries || 3) && (
            <button onClick={this.handleRetry}>
              Try again ({this.state.retryCount + 1}/3)
            </button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
```

### **2. Async Error Handling**

```typescript
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const throwError = useCallback((error: Error) => {
    setError(error)
  }, [])

  if (error) {
    throw error
  }

  return { resetError, throwError }
}

// Usage in async operations
const PokemonList = () => {
  const { throwError } = useAsyncError()

  const fetchPokemon = useCallback(async () => {
    try {
      const response = await fetch('/api/pokemon')
      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon')
      }
      return await response.json()
    } catch (error) {
      throwError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [throwError])

  // Component implementation
}
```

---

## Testing Patterns

### **1. Component Testing**

```typescript
// PokemonCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PokemonCard } from '../PokemonCard'

const mockPokemon = {
  id: 1,
  name: 'pikachu',
  types: ['electric'],
  sprites: { front_default: 'pikachu.png' }
}

describe('PokemonCard', () => {
  it('renders pokemon information correctly', () => {
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onSelect={jest.fn()}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
      />
    )

    expect(screen.getByText('pikachu')).toBeInTheDocument()
    expect(screen.getByText('electric')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onSelect={onSelect}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(mockPokemon)
  })

  it('handles favorite toggle correctly', () => {
    const onToggleFavorite = jest.fn()
    render(
      <PokemonCard
        pokemon={mockPokemon}
        onSelect={jest.fn()}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    )

    fireEvent.click(screen.getByText('Add Favorite'))
    expect(onToggleFavorite).toHaveBeenCalledWith(mockPokemon)
  })
})
```

### **2. Hook Testing**

```typescript
// useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useApi } from '../useApi'

// Mock fetch
global.fetch = jest.fn()

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    const mockData = [{ id: 1, name: 'pikachu' }]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const { result } = renderHook(() => useApi('/api/pokemon'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useApi('/api/pokemon'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })
})
```

---

## Accessibility Patterns

### **1. Keyboard Navigation**

```typescript
const SearchablePokemonList = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pokemon, setPokemon] = useState<Pokemon[]>([])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, pokemon.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (pokemon[selectedIndex]) {
          // Select pokemon
        }
        break
      case 'Escape':
        setSelectedIndex(-1)
        break
    }
  }, [pokemon, selectedIndex])

  return (
    <div
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Pokemon list"
    >
      {pokemon.map((pokemon, index) => (
        <div
          key={pokemon.id}
          role="option"
          aria-selected={index === selectedIndex}
          className={index === selectedIndex ? 'selected' : ''}
        >
          {pokemon.name}
        </div>
      ))}
    </div>
  )
}
```

### **2. ARIA Labels and Descriptions**

```typescript
const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Pokemon ${pokemon.name}, type ${pokemon.types.join(', ')}`}
      aria-describedby={`pokemon-${pokemon.id}-description`}
    >
      <img
        src={pokemon.sprites.front_default}
        alt={`${pokemon.name} front view`}
        onLoad={() => setImageLoaded(true)}
        aria-hidden={!imageLoaded}
      />
      
      <h3>{pokemon.name}</h3>
      
      <div
        id={`pokemon-${pokemon.id}-description`}
        className="sr-only"
      >
        {pokemon.name} is a {pokemon.types.join(' and ')} type Pokemon.
        Height: {pokemon.height / 10} meters.
        Weight: {pokemon.weight / 10} kilograms.
      </div>

      <button
        onClick={onToggleFavorite}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </article>
  )
}
```

---

## Advanced Patterns

### **1. Higher-Order Components**

```typescript
interface WithLoadingProps {
  loading: boolean
}

const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & WithLoadingProps) => {
    const { loading, ...restProps } = props

    if (loading) {
      return <LoadingSpinner />
    }

    return <Component {...(restProps as P)} />
  }
}

// Usage
const PokemonListWithLoading = withLoading(PokemonList)

// In component
<PokemonListWithLoading pokemon={pokemon} loading={loading} />
```

### **2. Render Props with Hooks**

```typescript
interface UsePokemonDataProps {
  children: (data: {
    pokemon: Pokemon[]
    loading: boolean
    error: string | null
    refetch: () => void
  }) => React.ReactNode
}

const UsePokemonData = ({ children }: UsePokemonDataProps) => {
  const { data, loading, error, execute } = useApi<Pokemon[]>('/api/pokemon')

  return <>{children({ pokemon: data || [], loading, error, refetch: execute })}</>
}

// Usage
<UsePokemonData>
  {({ pokemon, loading, error, refetch }) => (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}
      {pokemon.map(p => <PokemonCard key={p.id} pokemon={p} />)}
    </div>
  )}
</UsePokemonData>
```

### **3. Context with Reducer**

```typescript
interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  notifications: Notification[]
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    notifications: []
  })

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
```

---

## Best Practices Summary

### **1. Component Design**
- Keep components small and focused
- Use composition over inheritance
- Prefer functional components with hooks
- Use TypeScript for all props and state

### **2. Performance**
- Use React.memo for expensive components
- Implement lazy loading for routes
- Use useMemo and useCallback appropriately
- Avoid creating objects in render

### **3. State Management**
- Keep state as close to where it's used as possible
- Use context for truly global state
- Prefer local state over global state
- Use custom hooks for reusable state logic

### **4. Testing**
- Write tests for user interactions
- Test business logic, not implementation details
- Use data-testid for reliable selectors
- Mock external dependencies

### **5. Accessibility**
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

---

## Related Documentation

- [Frontend Architecture Guide](frontend-architecture-guide.md)
- [Vite Setup Guide](../../../docs/syntax/vite-setup-syntax.md)
- [Zustand State Management](../../../docs/syntax/zustand-state-syntax.md)
- [Tailwind CSS Guide](../../../docs/syntax/tailwind-css-syntax.md)
- [Testing Guide](testing-guide.md)

This guide provides comprehensive React patterns and best practices for the Pokedex frontend project.


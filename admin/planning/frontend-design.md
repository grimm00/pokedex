# Frontend Design Document - Phase 3

**Status**: DRAFT  
**Created**: 2025-09-15  
**Phase**: 3 - Frontend Development  
**Cycle**: Plan > Design > Implement > Test

## 🎯 **Design Overview**

This document outlines the frontend architecture and design system for the Pokedex application, following our established development cycle and technology stack decisions from ADR-001.

## 🏗️ **Architecture Design**

### **Technology Stack (from ADR-001)**
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Library**: Tailwind CSS + Headless UI
- **Testing**: Vitest + Testing Library

### **Project Structure**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   │   ├── Button.tsx         # Custom button with variants
│   │   │   ├── Card.tsx           # Pokemon card base
│   │   │   ├── Input.tsx          # Search input
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pokemon/        # Pokemon-specific components
│   │   │   ├── PokemonCard.tsx    # Main Pokemon display card
│   │   │   ├── PokemonList.tsx    # Grid of Pokemon cards
│   │   │   ├── PokemonDetail.tsx  # Individual Pokemon view
│   │   │   ├── TypeBadge.tsx      # Type color badges
│   │   │   └── StatBar.tsx        # Stats visualization
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx         # Navigation header
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx         # Main layout wrapper
│   │   └── auth/           # Authentication components
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── AuthGuard.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── PokemonListPage.tsx    # Main Pokemon listing
│   │   ├── PokemonDetailPage.tsx  # Individual Pokemon
│   │   ├── ProfilePage.tsx        # User profile/favorites
│   │   └── LoginPage.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── usePokemon.ts          # Pokemon data fetching
│   │   ├── useAuth.ts             # Authentication logic
│   │   └── useFavorites.ts        # Favorites management
│   ├── services/           # API service layer
│   │   ├── api.ts                 # API client configuration
│   │   ├── pokemonService.ts      # Pokemon API calls
│   │   └── authService.ts         # Authentication API calls
│   ├── store/              # Zustand state management
│   │   ├── pokemonStore.ts        # Pokemon data state
│   │   ├── authStore.ts           # Authentication state
│   │   └── favoritesStore.ts      # Favorites state
│   ├── types/              # TypeScript type definitions
│   │   ├── pokemon.ts             # Pokemon type definitions
│   │   ├── api.ts                 # API response types
│   │   └── user.ts                # User type definitions
│   └── utils/              # Utility functions
│       ├── constants.ts           # App constants
│       ├── pokemonUtils.ts        # Pokemon helper functions
│       └── typeColors.ts          # Type-to-color mapping
├── public/                 # Static assets
└── tests/                  # Test files
```

## 🎨 **Design System**

### **Color Palette**

#### **Pokemon Type Colors**
```typescript
const typeColors = {
  fire: 'bg-red-500',
  water: 'bg-blue-500', 
  grass: 'bg-green-500',
  electric: 'bg-yellow-500',
  psychic: 'bg-purple-500',
  ice: 'bg-cyan-500',
  dragon: 'bg-indigo-500',
  dark: 'bg-gray-800',
  fairy: 'bg-pink-500',
  normal: 'bg-gray-500',
  fighting: 'bg-orange-500',
  flying: 'bg-sky-500',
  poison: 'bg-violet-500',
  ground: 'bg-amber-600',
  rock: 'bg-stone-600',
  bug: 'bg-lime-500',
  ghost: 'bg-slate-600',
  steel: 'bg-zinc-500'
}
```

#### **Base Theme Colors**
```typescript
const theme = {
  primary: 'bg-gray-900/80',        // Greyish-black background
  card: 'bg-gray-800/60',           // Card background
  cardHover: 'transition-colors duration-300', // Smooth transitions
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400'
  },
  borders: 'border-gray-700',
  shadows: 'shadow-lg shadow-black/20'
}
```

### **Pokemon Card Design**

#### **Visual Design**
- **Base State**: Semi-transparent greyish-black background (`bg-gray-800/60`)
- **Hover State**: Type-specific color with smooth transition
- **Layout**: Square-ish with rounded corners (`rounded-lg`)
- **Elevation**: Subtle shadow effect (`shadow-lg`)
- **Content**: Image, name, types, stats preview
- **Animation**: Smooth color transition on hover (`transition-colors duration-300`)

#### **Card Structure**
```typescript
interface PokemonCardProps {
  pokemon: Pokemon;
  onCardClick: (pokemon: Pokemon) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (pokemon: Pokemon) => void;
}
```

### **Responsive Design Strategy**

#### **Mobile First Approach (320px+)**
- **Grid**: 1 column Pokemon layout
- **Navigation**: Stacked/hamburger menu
- **Cards**: Full-width with padding
- **Touch**: Large touch targets (44px minimum)
- **Typography**: Readable font sizes

#### **Tablet (768px+)**
- **Grid**: 2-3 column Pokemon layout
- **Navigation**: Horizontal navigation bar
- **Cards**: Medium-sized with consistent spacing
- **Interaction**: Hover states for mouse users

#### **Desktop (1024px+)**
- **Grid**: 3-4 column Pokemon layout
- **Navigation**: Full navigation bar with all features
- **Cards**: Larger cards with more detail preview
- **Features**: Advanced interactions and animations

#### **Breakpoints (Tailwind CSS)**
```css
/* Mobile First */
.pokemon-grid {
  @apply grid grid-cols-1 gap-4;
}

/* Small tablets */
@media (min-width: 640px) {
  .pokemon-grid {
    @apply grid-cols-2;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .pokemon-grid {
    @apply grid-cols-3;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .pokemon-grid {
    @apply grid-cols-4;
  }
}
```

## 🧩 **Component Design**

### **Core UI Components**

#### **Button Component**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### **Card Component**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
```

#### **Input Component**
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
```

### **Pokemon-Specific Components**

#### **PokemonCard Component**
- **Props**: Pokemon data, click handler, favorite toggle
- **Features**: Type-based hover colors, favorite heart icon
- **Layout**: Image, name, type badges, stats preview
- **States**: Loading, error, normal, favorite

#### **PokemonList Component**
- **Props**: Pokemon array, loading state, error state
- **Features**: Grid layout, pagination, search integration
- **Responsive**: Adapts columns based on screen size

#### **PokemonDetail Component**
- **Props**: Pokemon data, onClose handler
- **Features**: Full stats display, type information, abilities
- **Layout**: Modal or full-page view

## 🔄 **State Management Design**

### **Zustand Stores**

#### **Pokemon Store**
```typescript
interface PokemonStore {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedType: string | null;
  currentPage: number;
  totalPages: number;
  
  // Actions
  fetchPokemon: () => Promise<void>;
  searchPokemon: (query: string) => void;
  filterByType: (type: string | null) => void;
  setPage: (page: number) => void;
}
```

#### **Auth Store**
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

#### **Favorites Store**
```typescript
interface FavoritesStore {
  favorites: number[]; // Pokemon IDs
  loading: boolean;
  
  // Actions
  addFavorite: (pokemonId: number) => Promise<void>;
  removeFavorite: (pokemonId: number) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  isFavorite: (pokemonId: number) => boolean;
}
```

## 🔌 **API Integration Design**

### **Service Layer Architecture**

#### **API Client Configuration**
```typescript
// api.ts
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  setToken(token: string | null) {
    this.token = token;
  }
  
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Implementation with error handling, retry logic, etc.
  }
}
```

#### **Pokemon Service**
```typescript
// pokemonService.ts
export class PokemonService {
  async getPokemonList(params: PokemonListParams): Promise<PokemonListResponse> {
    // GET /api/v1/pokemon
  }
  
  async getPokemonById(id: number): Promise<Pokemon> {
    // GET /api/v1/pokemon/{id}
  }
  
  async searchPokemon(query: string): Promise<Pokemon[]> {
    // GET /api/v1/pokemon?search={query}
  }
  
  async filterPokemonByType(type: string): Promise<Pokemon[]> {
    // GET /api/v1/pokemon?type={type}
  }
}
```

## 🧪 **Testing Strategy**

### **Critical Paths to Test**

1. **Pokemon Listing**
   - Load and display Pokemon list
   - Pagination functionality
   - Loading and error states

2. **Search Functionality**
   - Search input and results
   - Type filtering
   - Clear search functionality

3. **Pokemon Detail View**
   - Individual Pokemon display
   - All data fields present
   - Navigation back to list

4. **Authentication Flow**
   - Login form validation
   - Registration process
   - Protected route access
   - Token management

5. **Favorites Management**
   - Add/remove favorites
   - Favorites list display
   - Persistence across sessions

### **Testing Approach**

#### **Unit Tests (Vitest)**
- Individual component rendering
- Props handling
- Event handlers
- Utility functions

#### **Integration Tests (Testing Library)**
- Component interactions
- API service calls
- State management
- User workflows

#### **E2E Tests (Playwright)**
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness

## 📱 **User Experience Design**

### **Loading States**
- **Skeleton screens** for Pokemon cards
- **Spinner** for API calls
- **Progressive loading** for images

### **Error Handling**
- **Error boundaries** for component crashes
- **User-friendly error messages**
- **Retry mechanisms** for failed API calls
- **Offline state** handling

### **Accessibility**
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Color contrast** compliance
- **Focus management** for modals

### **Performance**
- **Image lazy loading** for Pokemon sprites
- **Virtual scrolling** for large lists
- **Debounced search** to reduce API calls
- **Optimistic updates** for better UX

## 🚀 **Implementation Phases**

### **Phase 1: Foundation Setup**
1. Vite + React + TypeScript setup
2. Tailwind CSS configuration
3. Basic routing setup
4. API service layer

### **Phase 2: Core Components**
1. Base UI components (Button, Card, Input)
2. Pokemon card component
3. Pokemon list component
4. Basic layout components

### **Phase 3: Main Features**
1. Pokemon listing page
2. Search functionality
3. Pokemon detail page
4. Basic navigation

### **Phase 4: Authentication**
1. Login/register forms
2. Auth state management
3. Protected routes
4. Token handling

### **Phase 5: Advanced Features**
1. Favorites management
2. User profile
3. Advanced filtering
4. Performance optimization

### **Phase 6: Testing & Polish**
1. Critical path testing
2. Responsive design fixes
3. Accessibility improvements
4. Performance optimization

## 📊 **Success Metrics**

### **Technical Metrics**
- **Load Time**: < 3 seconds (from roadmap)
- **Test Coverage**: > 80% (from roadmap)
- **Performance**: Lighthouse score > 90
- **Accessibility**: WCAG 2.1 AA compliance

### **User Experience Metrics**
- **Responsive Design**: Works on all device sizes
- **Navigation**: Intuitive user flows
- **Search**: Fast and accurate results
- **Authentication**: Smooth login/register process

## 🔄 **Iteration Strategy**

### **Design Iterations**
- **User feedback** collection
- **A/B testing** for UI improvements
- **Performance monitoring** and optimization
- **Accessibility audits** and improvements

### **Development Iterations**
- **Incremental feature** development
- **Continuous testing** integration
- **Code review** process
- **Documentation updates**

---

## 📚 **Learning Resources & Technology Deep Dive**

### **Vite - Build Tool & Development Server**

**What is Vite?**
- **Ultra-fast** build tool and development server
- **ES modules** based (faster than bundling)
- **Hot Module Replacement (HMR)** for instant updates
- **Plugin ecosystem** for React, TypeScript, etc.

**Key Benefits:**
- ⚡ **Lightning fast** cold starts (vs Webpack)
- 🔥 **Instant HMR** - changes appear immediately
- 📦 **Optimized builds** with Rollup under the hood
- 🛠️ **Zero config** for many common setups

**Learning Path:**
1. **Vite vs Webpack** - Why we chose Vite
2. **Project structure** - How Vite organizes files
3. **Configuration** - `vite.config.ts` basics
4. **Plugins** - React, TypeScript, Tailwind integration
5. **Build process** - Development vs production

**Resources:**
- [Vite Official Guide](https://vitejs.dev/guide/)
- [Vite + React Tutorial](https://vitejs.dev/guide/features.html#react)
- [Vite vs Create React App](https://vitejs.dev/guide/comparisons.html#create-react-app)

### **Zustand - State Management**

**What is Zustand?**
- **Lightweight** state management (2.9kb gzipped)
- **No boilerplate** - no providers, reducers, or actions
- **TypeScript first** - excellent type inference
- **React hooks** based API

**Key Concepts:**
- **Store** - Single source of truth
- **Actions** - Functions that update state
- **Selectors** - Functions that extract specific state
- **Subscriptions** - Components automatically re-render on state changes

**Why Zustand over Redux?**
- ✅ **Simpler** - Less boilerplate code
- ✅ **Faster** - No unnecessary re-renders
- ✅ **Smaller** - Much smaller bundle size
- ✅ **TypeScript** - Better type safety out of the box

**Learning Path:**
1. **Basic store** - Creating your first store
2. **Actions** - Updating state with functions
3. **Selectors** - Using specific pieces of state
4. **Async actions** - Handling API calls
5. **Devtools** - Debugging with Redux DevTools

**Example Store Structure:**
```typescript
// store/pokemonStore.ts
interface PokemonState {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  searchQuery: string
}

interface PokemonActions {
  fetchPokemon: () => Promise<void>
  setSearchQuery: (query: string) => void
  addToFavorites: (pokemon: Pokemon) => void
}

type PokemonStore = PokemonState & PokemonActions
```

**Resources:**
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand TypeScript Guide](https://github.com/pmndrs/zustand#typescript)
- [Zustand vs Redux](https://blog.logrocket.com/zustand-vs-redux-comparison/)

### **Tailwind CSS - Utility-First CSS**

**What is Tailwind?**
- **Utility-first** CSS framework
- **Pre-built components** you can customize
- **Responsive design** built-in
- **Dark mode** support

**Key Concepts:**
- **Utility classes** - `bg-blue-500`, `text-lg`, `flex`
- **Responsive prefixes** - `md:`, `lg:`, `xl:`
- **State variants** - `hover:`, `focus:`, `active:`
- **Custom configuration** - Extend with your own values

**Learning Path:**
1. **Utility classes** - Common patterns
2. **Responsive design** - Mobile-first approach
3. **Customization** - Extending the default theme
4. **Components** - Building reusable UI components
5. **Best practices** - When to use utilities vs components

### **Headless UI - Unstyled Components**

**What is Headless UI?**
- **Unstyled, accessible** React components
- **Focus management** and keyboard navigation
- **ARIA attributes** built-in
- **Customizable** with your own styles

**Components we'll use:**
- **Dialog** - Modals and overlays
- **Listbox** - Custom select dropdowns
- **Combobox** - Searchable select inputs
- **Disclosure** - Collapsible content

**Why Headless UI?**
- ✅ **Accessibility** - WCAG compliant out of the box
- ✅ **Customizable** - Style however you want
- ✅ **Lightweight** - Only what you need
- ✅ **React** - Built specifically for React

### **Learning Timeline**

**Week 1: Foundation**
- Set up Vite + React + TypeScript
- Learn basic Tailwind utilities
- Create first components

**Week 2: State Management**
- Implement Zustand store
- Connect components to state
- Handle async operations

**Week 3: Advanced UI**
- Headless UI components
- Responsive design patterns
- Custom component library

**Week 4: Integration**
- Connect to backend API
- Error handling and loading states
- Performance optimization

---

**Next Steps**: Proceed to Implementation Phase with Vite + React + TypeScript setup.

**Related Documents**:
- [ADR-001: Technology Stack Selection](../adrs/adr-001-technology-stack.md)
- [Project Roadmap](../roadmap.md)
- [Collaboration Rules](../../collaboration/rules.md)

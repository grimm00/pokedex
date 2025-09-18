export const POKEMON_TYPES = [
  'all',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
] as const

export const POKEMON_TYPE_COLORS = {
  fire: '#FF6B6B',
  water: '#4ECDC4',
  grass: '#45B7D1',
  electric: '#FFE66D',
  psychic: '#A8E6CF',
  ice: '#B4F8C8',
  dragon: '#FFB6C1',
  dark: '#2C3E50',
  fairy: '#FFB6C1',
  normal: '#95A5A6',
  fighting: '#E74C3C',
  flying: '#85C1E9',
  poison: '#9B59B6',
  ground: '#D2B48C',
  rock: '#A0522D',
  bug: '#27AE60',
  ghost: '#8E44AD',
  steel: '#7F8C8D',
} as const

export const API_ENDPOINTS = {
  POKEMON: '/api/v1/pokemon',
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
  },
  USERS: {
    ME: '/api/v1/users/me',
    FAVORITES: '/api/v1/users/favorites',
  },
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 10000,
} as const


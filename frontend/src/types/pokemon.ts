export type PokemonType =
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'psychic'
  | 'ice'
  | 'dragon'
  | 'dark'
  | 'fairy'
  | 'normal'
  | 'fighting'
  | 'flying'
  | 'poison'
  | 'ground'
  | 'rock'
  | 'bug'
  | 'ghost'
  | 'steel'

export interface PokemonSprites {
  front_default: string
  front_shiny?: string
  back_default?: string
  back_shiny?: string
  other?: {
    'official-artwork'?: {
      front_default: string
    }
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonAbility {
  ability: {
    name: string
    url: string
  }
  is_hidden: boolean
  slot: number
}

export interface Pokemon {
  id: number
  pokemon_id: number  // PokeAPI ID
  name: string
  height: number  // in decimeters
  weight: number  // in hectograms
  base_experience?: number
  types: string[]  // JSON array from backend
  abilities: string[]  // JSON array from backend
  stats: { [key: string]: number }  // JSON object from backend
  sprites: { [key: string]: string }  // JSON object from backend
  created_at?: string
  updated_at?: string
}

export interface PokemonListResponse {
  pokemon: Pokemon[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface PokemonDetailResponse {
  pokemon: Pokemon
}

export interface PokemonSearchParams {
  search?: string
  type?: PokemonType | 'all'
  page?: number
  per_page?: number
}


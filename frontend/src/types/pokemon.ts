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
  name: string
  height: number
  weight: number
  types: string[]  // Simplified for frontend display
  abilities: { name: string }[]  // Simplified for frontend display
  stats: { name: string; base_stat: number }[]  // Simplified for frontend display
  sprites: { front_default: string }  // Simplified for frontend display
  created_at?: string
  updated_at?: string
}

export interface PokemonListResponse {
  data: Pokemon[]
  total: number
  page: number
  per_page: number
}

export interface PokemonDetailResponse {
  data: Pokemon
}

export interface PokemonSearchParams {
  search?: string
  type?: PokemonType | 'all'
  page?: number
  per_page?: number
}


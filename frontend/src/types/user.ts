export interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface UserProfile {
  user: User
  favorite_pokemon: number[]
  total_favorites: number
}


export interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: User
  access_token: string
  refresh_token: string
}

export interface UserProfile {
  user: User
  favorite_pokemon: number[]
  total_favorites: number
}


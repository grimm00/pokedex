import { apiClient } from './api'
import type { AuthResponse, User, LoginCredentials, RegisterCredentials } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials)
    return response.data
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', credentials)
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    })
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/profile')
    return response.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/auth/profile', userData)
    return response.data
  }
}
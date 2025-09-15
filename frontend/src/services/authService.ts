import { apiClient } from './api'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials)
    return response.data
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', userData)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout')
    localStorage.removeItem('token')
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh')
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/users/me')
    return response.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/users/me', userData)
    return response.data
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  setToken(token: string): void {
    localStorage.setItem('token', token)
  },
}

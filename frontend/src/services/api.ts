import type { ApiResponse, ApiConfig } from '@/types'

export class ApiError extends Error {
  public status: number
  public details?: Record<string, any>

  constructor(message: string, status: number, details?: Record<string, any>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

class ApiClient {
  private config: ApiConfig

  constructor() {
    this.config = {
      baseURL: 'http://localhost:5000', // Use direct backend URL for now
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.config.baseURL ? `${this.config.baseURL}${endpoint}` : endpoint

    const token = localStorage.getItem('access_token')
    const headers = {
      ...this.config.headers,
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    }

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred',
          response.status,
          data
        )
      }

      return {
        data: data.data || data,
        message: data.message,
        status: response.status,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        { originalError: error }
      )
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

export const apiClient = new ApiClient()

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}


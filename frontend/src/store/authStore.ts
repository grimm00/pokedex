import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
    // User data
    user: User | null
    isAuthenticated: boolean

    // Tokens
    accessToken: string | null
    refreshToken: string | null

    // UI state
    loading: boolean
    error: string | null
}

interface AuthActions {
    // Authentication actions
    login: (credentials: LoginCredentials) => Promise<void>
    register: (credentials: RegisterCredentials) => Promise<void>
    logout: () => Promise<void>
    refreshAuth: () => Promise<void>

    // User actions
    getProfile: () => Promise<void>
    updateProfile: (userData: Partial<User>) => Promise<void>

    // Utility actions
    clearError: () => void
    reset: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    loading: false,
    error: null
}

export const useAuthStore = create<AuthStore>()(
    devtools(
        immer((set, get) => ({
            ...initialState,

            login: async (credentials: LoginCredentials) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    const response = await authService.login(credentials)

                    // Store tokens in localStorage
                    localStorage.setItem('access_token', response.access_token)
                    localStorage.setItem('refresh_token', response.refresh_token)

                    set((state) => {
                        state.user = response.user
                        state.isAuthenticated = true
                        state.accessToken = response.access_token
                        state.refreshToken = response.refresh_token
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Login failed'
                        state.loading = false
                    })
                    throw error
                }
            },

            register: async (credentials: RegisterCredentials) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    const response = await authService.register(credentials)

                    // Store tokens in localStorage
                    localStorage.setItem('access_token', response.access_token)
                    localStorage.setItem('refresh_token', response.refresh_token)

                    set((state) => {
                        state.user = response.user
                        state.isAuthenticated = true
                        state.accessToken = response.access_token
                        state.refreshToken = response.refresh_token
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Registration failed'
                        state.loading = false
                    })
                    throw error
                }
            },

            logout: async () => {
                set((state) => {
                    state.loading = true
                })

                try {
                    await authService.logout()
                } catch (error) {
                    // Continue with logout even if API call fails
                    console.error('Logout API call failed:', error)
                } finally {
                    // Clear tokens and user data
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')

                    set((state) => {
                        state.user = null
                        state.isAuthenticated = false
                        state.accessToken = null
                        state.refreshToken = null
                        state.loading = false
                        state.error = null
                    })
                }
            },

            refreshAuth: async () => {
                const { refreshToken } = get()
                if (!refreshToken) return

                try {
                    const response = await authService.refreshToken(refreshToken)

                    // Update tokens
                    localStorage.setItem('access_token', response.access_token)
                    localStorage.setItem('refresh_token', response.refresh_token)

                    set((state) => {
                        state.accessToken = response.access_token
                        state.refreshToken = response.refresh_token
                        state.user = response.user
                        state.isAuthenticated = true
                    })
                } catch (error) {
                    // If refresh fails, logout user
                    get().logout()
                }
            },

            getProfile: async () => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    const user = await authService.getProfile()
                    set((state) => {
                        state.user = user
                        state.isAuthenticated = true
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Failed to get profile'
                        state.loading = false
                    })
                    throw error
                }
            },

            updateProfile: async (userData: Partial<User>) => {
                set((state) => {
                    state.loading = true
                    state.error = null
                })

                try {
                    const updatedUser = await authService.updateProfile(userData)
                    set((state) => {
                        state.user = updatedUser
                        state.loading = false
                    })
                } catch (error) {
                    set((state) => {
                        state.error = error instanceof Error ? error.message : 'Failed to update profile'
                        state.loading = false
                    })
                    throw error
                }
            },

            clearError: () => {
                set((state) => {
                    state.error = null
                })
            },

            reset: () => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                set((state) => {
                    state.user = null
                    state.isAuthenticated = false
                    state.accessToken = null
                    state.refreshToken = null
                    state.loading = false
                    state.error = null
                })
            }
        })),
        {
            name: 'auth-store'
        }
    )
)

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authService } from '@/services'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface UserActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  getCurrentUser: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  clearError: () => void
  reset: () => void
}

type UserStore = UserState & UserActions

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      login: async (credentials: LoginRequest) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await authService.login(credentials)
          authService.setToken(response.access_token)
          
          set((state) => {
            state.user = response.user
            state.isAuthenticated = true
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Login failed'
            state.loading = false
          })
        }
      },

      register: async (userData: RegisterRequest) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          const response = await authService.register(userData)
          authService.setToken(response.access_token)
          
          set((state) => {
            state.user = response.user
            state.isAuthenticated = true
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Registration failed'
            state.loading = false
          })
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          // Ignore logout errors
        } finally {
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.loading = false
            state.error = null
          })
        }
      },

      refreshToken: async () => {
        set((state) => {
          state.loading = true
        })

        try {
          const response = await authService.refreshToken()
          authService.setToken(response.access_token)
          
          set((state) => {
            state.user = response.user
            state.isAuthenticated = true
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.loading = false
            state.error = 'Session expired. Please log in again.'
          })
        }
      },

      getCurrentUser: async () => {
        if (!authService.isAuthenticated()) {
          set((state) => {
            state.isAuthenticated = false
            state.user = null
          })
          return
        }

        set((state) => {
          state.loading = true
        })

        try {
          const user = await authService.getCurrentUser()
          set((state) => {
            state.user = user
            state.isAuthenticated = true
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.loading = false
            state.error = 'Failed to get user information'
          })
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
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      reset: () => {
        set(() => ({ ...initialState }))
      },
    })),
    { name: 'user-store' }
  )
)

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UIState {
  modals: {
    pokemonDetail: boolean
    login: boolean
    register: boolean
  }
  notifications: Notification[]
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  loading: boolean
}

interface UIActions {
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Notification actions
  addNotification: (message: string, type: Notification['type'], duration?: number) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLoading: (loading: boolean) => void
  
  // Utility actions
  reset: () => void
}

type UIStore = UIState & UIActions

const initialState: UIState = {
  modals: {
    pokemonDetail: false,
    login: false,
    register: false,
  },
  notifications: [],
  sidebarOpen: false,
  theme: 'light',
  loading: false,
}

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      openModal: (modal: keyof UIState['modals']) => {
        set((state) => {
          state.modals[modal] = true
        })
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set((state) => {
          state.modals[modal] = false
        })
      },

      closeAllModals: () => {
        set((state) => {
          state.modals = {
            pokemonDetail: false,
            login: false,
            register: false,
          }
        })
      },

      addNotification: (message: string, type: Notification['type'], duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9)
        const notification: Notification = { id, message, type, duration }
        
        set((state) => {
          state.notifications.push(notification)
        })

        // Auto-remove notification after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, duration)
        }
      },

      removeNotification: (id: string) => {
        set((state) => {
          state.notifications = state.notifications.filter((n: Notification) => n.id !== id)
        })
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = []
        })
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        })
      },

      setSidebarOpen: (open: boolean) => {
        set((state) => {
          state.sidebarOpen = open
        })
      },

      setTheme: (theme: 'light' | 'dark') => {
        set((state) => {
          state.theme = theme
        })
        
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('theme', theme)
      },

      toggleTheme: () => {
        const { theme } = get()
        get().setTheme(theme === 'light' ? 'dark' : 'light')
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.loading = loading
        })
      },

      reset: () => {
        set(() => ({ ...initialState }))
      },
    })),
    { name: 'ui-store' }
  )
)

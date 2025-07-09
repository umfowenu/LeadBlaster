import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email, password) => {
        // Simple mock authentication
        if (email && password) {
          set({ 
            isAuthenticated: true, 
            user: { email, name: email.split('@')[0] } 
          })
          return true
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOpenAIStore = create(
  persist(
    (set, get) => ({
      apiKey: null,
      isValidated: false,
      isValidating: false,
      validationError: null,
      lastValidated: null,

      setApiKey: (key) => {
        set({ 
          apiKey: key,
          isValidated: false,
          validationError: null,
          lastValidated: null
        })
      },

      validateApiKey: async (key) => {
        set({ isValidating: true, validationError: null })
        
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            set({ 
              apiKey: key,
              isValidated: true,
              isValidating: false,
              validationError: null,
              lastValidated: new Date().toISOString()
            })
            return { success: true }
          } else {
            const errorData = await response.json()
            const errorMessage = errorData.error?.message || 'Invalid API key'
            set({ 
              isValidated: false,
              isValidating: false,
              validationError: errorMessage
            })
            return { success: false, error: errorMessage }
          }
        } catch (error) {
          const errorMessage = 'Network error. Please check your connection.'
          set({ 
            isValidated: false,
            isValidating: false,
            validationError: errorMessage
          })
          return { success: false, error: errorMessage }
        }
      },

      clearApiKey: () => {
        set({
          apiKey: null,
          isValidated: false,
          validationError: null,
          lastValidated: null
        })
      },

      hasValidKey: () => {
        const state = get()
        return state.apiKey && state.isValidated
      }
    }),
    {
      name: 'openai-storage'
    }
  )
)

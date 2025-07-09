import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultTheme = {
  mode: 'light',
  primaryColor: '#3b82f6',
  fontSize: 'medium'
}

const defaultChecklist = {
  id: '',
  name: '',
  description: '',
  logo: '',
  bannerImage: '',
  categories: [],
  theme: defaultTheme,
  optInEnabled: false,
  optInFormHtml: '',
  callToAction: {
    text: '',
    link: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const useChecklistStore = create(
  persist(
    (set, get) => ({
      checklists: [],
      currentChecklist: null,
      analytics: {},

      // CRUD operations
      createChecklist: (name) => {
        const id = Date.now().toString()
        const newChecklist = {
          ...defaultChecklist,
          id,
          name: name.trim(), // Ensure clean name
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => {
          // Prevent duplicates
          const existingIndex = state.checklists.findIndex(c => c.id === id)
          const updatedChecklists = existingIndex >= 0 
            ? state.checklists.map((c, i) => i === existingIndex ? newChecklist : c)
            : [...state.checklists, newChecklist]
          
          return {
            checklists: updatedChecklists,
            currentChecklist: newChecklist
          }
        })
        
        return id
      },

      updateChecklist: (id, updates) => {
        set(state => {
          const updatedChecklists = state.checklists.map(checklist =>
            checklist.id === id
              ? { ...checklist, ...updates, updatedAt: new Date().toISOString() }
              : checklist
          )
          
          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === id
              ? { ...state.currentChecklist, ...updates, updatedAt: new Date().toISOString() }
              : state.currentChecklist
          }
        })
      },

      deleteChecklist: (id) => {
        set(state => ({
          checklists: state.checklists.filter(checklist => checklist.id !== id),
          currentChecklist: state.currentChecklist?.id === id ? null : state.currentChecklist
        }))
      },

      setCurrentChecklist: (id) => {
        const checklist = get().checklists.find(c => c.id === id)
        set({ currentChecklist: checklist || null })
      },

      // Category operations
      addCategory: (name) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const newCategory = {
          id: Date.now().toString(),
          name: name.trim(),
          items: []
        }

        const updatedCategories = [...currentChecklist.categories, newCategory]
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
        
        return newCategory.id
      },

      updateCategory: (categoryId, updates) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const updatedCategories = currentChecklist.categories.map(category =>
          category.id === categoryId ? { ...category, ...updates } : category
        )
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
      },

      deleteCategory: (categoryId) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const updatedCategories = currentChecklist.categories.filter(
          category => category.id !== categoryId
        )
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
      },

      // Item operations
      addItem: (categoryId, name) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const newItem = {
          id: Date.now().toString(),
          name: name.trim(),
          description: '',
          bulletPoints: [],
          videoUrl: '',
          completed: false
        }

        const updatedCategories = currentChecklist.categories.map(category =>
          category.id === categoryId
            ? { ...category, items: [...category.items, newItem] }
            : category
        )
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
      },

      updateItem: (categoryId, itemId, updates) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const updatedCategories = currentChecklist.categories.map(category =>
          category.id === categoryId
            ? {
                ...category,
                items: category.items.map(item =>
                  item.id === itemId ? { ...item, ...updates } : item
                )
              }
            : category
        )
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
      },

      deleteItem: (categoryId, itemId) => {
        const { currentChecklist } = get()
        if (!currentChecklist) return

        const updatedCategories = currentChecklist.categories.map(category =>
          category.id === categoryId
            ? { ...category, items: category.items.filter(item => item.id !== itemId) }
            : category
        )
        get().updateChecklist(currentChecklist.id, { categories: updatedCategories })
      },

      // Analytics
      trackView: (checklistId) => {
        set(state => ({
          analytics: {
            ...state.analytics,
            [checklistId]: {
              ...state.analytics[checklistId],
              views: (state.analytics[checklistId]?.views || 0) + 1
            }
          }
        }))
      },

      trackOptIn: (checklistId) => {
        set(state => ({
          analytics: {
            ...state.analytics,
            [checklistId]: {
              ...state.analytics[checklistId],
              optIns: (state.analytics[checklistId]?.optIns || 0) + 1
            }
          }
        }))
      }
    }),
    {
      name: 'checklist-storage'
    }
  )
)

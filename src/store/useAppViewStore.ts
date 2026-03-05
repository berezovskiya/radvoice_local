import { create } from 'zustand'

type AppView = 'main' | 'templateEditor'

interface AppViewStore {
  currentView: AppView
  editingTemplateFile: string | null
  openTemplateEditor: (file?: string | null) => void
  closeTemplateEditor: () => void
}

export const useAppViewStore = create<AppViewStore>((set) => ({
  currentView: 'main',
  editingTemplateFile: null,

  openTemplateEditor: (file = null) => {
    set({ currentView: 'templateEditor', editingTemplateFile: file })
  },

  closeTemplateEditor: () => {
    set({ currentView: 'main', editingTemplateFile: null })
  },
}))

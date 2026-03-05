import { create } from 'zustand'
import type { Template, TemplateListItem } from '../types/template'

interface TemplateStore {
  // List of available templates (for dropdown)
  templateList: TemplateListItem[]
  isLoadingList: boolean

  // Currently selected template (full data)
  selectedTemplate: Template | null
  isLoadingTemplate: boolean

  // Actions
  fetchTemplateList: () => Promise<void>
  selectTemplate: (file: string) => Promise<void>
  clearTemplate: () => void
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templateList: [],
  isLoadingList: false,
  selectedTemplate: null,
  isLoadingTemplate: false,

  fetchTemplateList: async () => {
    set({ isLoadingList: true })
    try {
      const list = await window.electronAPI.getTemplateList()
      set({ templateList: list })
    } catch (err) {
      console.error('Failed to fetch template list:', err)
    } finally {
      set({ isLoadingList: false })
    }
  },

  selectTemplate: async (file: string) => {
    set({ isLoadingTemplate: true })
    try {
      const template = await window.electronAPI.loadTemplate(file)
      set({ selectedTemplate: template })
    } catch (err) {
      console.error('Failed to load template:', err)
    } finally {
      set({ isLoadingTemplate: false })
    }
  },

  clearTemplate: () => {
    set({ selectedTemplate: null })
  },
}))

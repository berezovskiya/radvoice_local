import { create } from 'zustand'
import type { Template, TemplateSection, ChecklistItem } from '../types/template'
import { useTemplateStore } from './useTemplateStore'

function uid() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function createBlankTemplate(): Template {
  return {
    id: uid(),
    name: '',
    modality: '',
    bodyPart: '',
    language: 'uk',
    version: '1.0.0',
    sections: [
      {
        id: 'patient_info',
        title: 'Дані пацієнта',
        type: 'group',
        subsections: [
          { id: 'patient_name', title: 'ПІБ пацієнта', defaultText: '' },
          { id: 'patient_dob', title: 'Дата народження пацієнта', defaultText: '', placeholder: 'ДД/ММ/РРРР' },
          { id: 'patient_id', title: 'ID пацієнта', defaultText: '' },
          { id: 'exam_date', title: 'Дата обстеження', defaultText: '', placeholder: 'ДД/ММ/РРРР' },
        ],
      },
    ],
  }
}

interface TemplateEditorStore {
  draft: Template
  originalFileName: string | null
  isDirty: boolean
  isLoading: boolean

  initNew: () => void
  loadExisting: (fileName: string) => Promise<void>

  updateMetadata: <K extends keyof Template>(field: K, value: Template[K]) => void
  setSections: (sections: TemplateSection[]) => void
  setChecklist: (checklist: ChecklistItem[]) => void

  save: () => Promise<void>
  deleteTemplate: () => Promise<void>
  duplicate: () => void
  importFromFile: () => Promise<void>
  exportToFile: () => Promise<void>
}

export const useTemplateEditorStore = create<TemplateEditorStore>((set, get) => ({
  draft: createBlankTemplate(),
  originalFileName: null,
  isDirty: false,
  isLoading: false,

  initNew: () => {
    set({ draft: createBlankTemplate(), originalFileName: null, isDirty: false })
  },

  loadExisting: async (fileName: string) => {
    set({ isLoading: true })
    try {
      const template = await window.electronAPI.loadTemplate(fileName)
      set({ draft: template, originalFileName: fileName, isDirty: false })
    } catch (err) {
      console.error('Failed to load template for editing:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  updateMetadata: (field, value) => {
    const draft = { ...get().draft, [field]: value }
    set({ draft, isDirty: true })
  },

  setSections: (sections: TemplateSection[]) => {
    set({ draft: { ...get().draft, sections }, isDirty: true })
  },

  setChecklist: (checklist: ChecklistItem[]) => {
    set({ draft: { ...get().draft, checklist }, isDirty: true })
  },

  save: async () => {
    const { draft, originalFileName } = get()
    const fileName = originalFileName ?? `${draft.id}.json`
    try {
      await window.electronAPI.saveTemplate(fileName, draft)
      set({ originalFileName: fileName, isDirty: false })
      await useTemplateStore.getState().fetchTemplateList()
    } catch (err) {
      console.error('Failed to save template:', err)
    }
  },

  deleteTemplate: async () => {
    const { originalFileName, draft } = get()
    if (!originalFileName) return
    if (!window.confirm(`Видалити шаблон "${draft.name}"?`)) return
    try {
      await window.electronAPI.deleteTemplate(originalFileName)
      get().initNew()
      await useTemplateStore.getState().fetchTemplateList()
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  },

  duplicate: () => {
    const { draft } = get()
    const duplicated: Template = {
      ...draft,
      id: uid(),
      name: `${draft.name} (копія)`,
    }
    set({ draft: duplicated, originalFileName: null, isDirty: true })
  },

  importFromFile: async () => {
    try {
      const imported = await window.electronAPI.importTemplateFile()
      if (!imported) return
      set({
        draft: { ...imported, id: uid() },
        originalFileName: null,
        isDirty: true,
      })
    } catch (err) {
      console.error('Failed to import template:', err)
    }
  },

  exportToFile: async () => {
    try {
      await window.electronAPI.exportTemplateFile(get().draft)
    } catch (err) {
      console.error('Failed to export template:', err)
    }
  },
}))

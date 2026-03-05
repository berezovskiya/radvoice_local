import { create } from 'zustand'
import type { MappingResult, SectionUpdate, UnmappedFragment } from '../types/mapping'
import type { Template } from '../types/template'

// Sections that should not receive auto-norma (no meaningful "normal" text)
const SKIP_AUTO_NORMA_IDS = new Set([
  'patient_info', 'patient_name', 'patient_dob', 'patient_id', 'exam_date',
  'clinical_info', 'recommendations',
])

interface MappingStore {
  mappingResult: MappingResult | null
  isProcessing: boolean
  processingError: string | null

  // Traceability: hovered section id
  hoveredSectionId: string | null

  // Impression generation
  impressionSuggestion: string | null
  isGeneratingImpression: boolean
  impressionError: string | null

  setProcessing: (value: boolean) => void
  setMappingResult: (result: MappingResult) => void
  setProcessingError: (error: string | null) => void
  getSectionUpdate: (sectionId: string) => SectionUpdate | undefined
  getUnmappedFragments: () => UnmappedFragment[]
  setHoveredSectionId: (id: string | null) => void
  updateSectionText: (sectionId: string, newText: string) => void
  applyAutoNormaSection: (sectionId: string, normalText: string) => void
  applyAutoNormaAll: (template: Template) => void
  setGeneratingImpression: (value: boolean) => void
  setImpressionSuggestion: (text: string) => void
  setImpressionError: (error: string | null) => void
  acceptImpression: () => void
  dismissImpression: () => void
  clearMapping: () => void
}

export const useMappingStore = create<MappingStore>((set, get) => ({
  mappingResult: null,
  isProcessing: false,
  processingError: null,
  hoveredSectionId: null,
  impressionSuggestion: null,
  isGeneratingImpression: false,
  impressionError: null,

  setProcessing: (value) => set({ isProcessing: value, processingError: null }),

  setMappingResult: (result) =>
    set({ mappingResult: result, isProcessing: false, processingError: null }),

  setProcessingError: (error) =>
    set({ processingError: error, isProcessing: false }),

  getSectionUpdate: (sectionId) => {
    const result = get().mappingResult
    if (!result) return undefined
    return result.sectionUpdates.find((u) => u.sectionId === sectionId)
  },

  getUnmappedFragments: () => {
    return get().mappingResult?.unmappedFragments ?? []
  },

  setHoveredSectionId: (id) => set({ hoveredSectionId: id }),

  updateSectionText: (sectionId, newText) =>
    set((state) => {
      const result = state.mappingResult
      if (!result) return state
      return {
        mappingResult: {
          ...result,
          sectionUpdates: result.sectionUpdates.map((u) =>
            u.sectionId === sectionId ? { ...u, newText } : u,
          ),
        },
      }
    }),

  applyAutoNormaSection: (sectionId, normalText) =>
    set((state) => {
      const result = state.mappingResult ?? { sectionUpdates: [], unmappedFragments: [] }
      const exists = result.sectionUpdates.find((u) => u.sectionId === sectionId)

      // Don't overwrite sections already replaced by AI or confirmed normal
      if (exists && (exists.action === 'replaced' || exists.action === 'confirmed_normal')) return state

      const newUpdate: SectionUpdate = {
        sectionId,
        action: 'auto_normal',
        newText: normalText,
        sourceFragments: [],
      }

      const sectionUpdates = exists
        ? result.sectionUpdates.map((u) => (u.sectionId === sectionId ? newUpdate : u))
        : [...result.sectionUpdates, newUpdate]

      return { mappingResult: { ...result, sectionUpdates } }
    }),

  applyAutoNormaAll: (template) =>
    set((state) => {
      const result = state.mappingResult ?? { sectionUpdates: [], unmappedFragments: [] }
      const existingIds = new Set(
        result.sectionUpdates
          .filter((u) => u.action === 'replaced' || u.action === 'confirmed_normal')
          .map((u) => u.sectionId),
      )

      const newUpdates: SectionUpdate[] = [...result.sectionUpdates]

      for (const section of template.sections) {
        if (section.type === 'group' && section.subsections) {
          for (const sub of section.subsections) {
            if (SKIP_AUTO_NORMA_IDS.has(sub.id) || existingIds.has(sub.id)) continue
            const text = sub.normalText || sub.defaultText
            if (!text) continue

            const existing = newUpdates.findIndex((u) => u.sectionId === sub.id)
            const update: SectionUpdate = {
              sectionId: sub.id,
              action: 'auto_normal',
              newText: text,
              sourceFragments: [],
            }
            if (existing >= 0) newUpdates[existing] = update
            else newUpdates.push(update)
          }
        } else {
          if (SKIP_AUTO_NORMA_IDS.has(section.id) || existingIds.has(section.id)) continue
          const text = section.normalText || section.defaultText
          if (!text) continue

          const existing = newUpdates.findIndex((u) => u.sectionId === section.id)
          const update: SectionUpdate = {
            sectionId: section.id,
            action: 'auto_normal',
            newText: text,
            sourceFragments: [],
          }
          if (existing >= 0) newUpdates[existing] = update
          else newUpdates.push(update)
        }
      }

      return { mappingResult: { ...result, sectionUpdates: newUpdates } }
    }),

  setGeneratingImpression: (value) =>
    set({ isGeneratingImpression: value, impressionError: null }),

  setImpressionSuggestion: (text) =>
    set({ impressionSuggestion: text, isGeneratingImpression: false, impressionError: null }),

  setImpressionError: (error) =>
    set({ impressionError: error, isGeneratingImpression: false }),

  acceptImpression: () =>
    set((state) => {
      const suggestion = state.impressionSuggestion
      if (!suggestion) return state

      const result = state.mappingResult
      if (!result) return state

      const impressionUpdate: SectionUpdate = {
        sectionId: 'impression',
        action: 'replaced',
        newText: suggestion,
        sourceFragments: [],
      }

      const exists = result.sectionUpdates.findIndex((u) => u.sectionId === 'impression')
      const sectionUpdates = exists >= 0
        ? result.sectionUpdates.map((u) => (u.sectionId === 'impression' ? impressionUpdate : u))
        : [...result.sectionUpdates, impressionUpdate]

      return {
        mappingResult: { ...result, sectionUpdates },
        impressionSuggestion: null,
      }
    }),

  dismissImpression: () =>
    set({ impressionSuggestion: null, impressionError: null }),

  clearMapping: () =>
    set({
      mappingResult: null, isProcessing: false, processingError: null, hoveredSectionId: null,
      impressionSuggestion: null, isGeneratingImpression: false, impressionError: null,
    }),
}))

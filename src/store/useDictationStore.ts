import { create } from 'zustand'
import type { DictationEntry } from '../types/dictation'

interface DictationStore {
  entries: DictationEntry[]
  isRecording: boolean
  isTranscribing: boolean
  nextId: number

  setRecording: (value: boolean) => void
  setTranscribing: (value: boolean) => void
  addEntry: (text: string, audioLengthSeconds: number) => void
  removeEntry: (id: number) => void
  updateEntryText: (id: number, text: string) => void
  clearAll: () => void
  getFullTranscript: () => string
}

export const useDictationStore = create<DictationStore>((set, get) => ({
  entries: [],
  isRecording: false,
  isTranscribing: false,
  nextId: 1,

  setRecording: (value) => set({ isRecording: value }),
  setTranscribing: (value) => set({ isTranscribing: value }),

  addEntry: (text, audioLengthSeconds) => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: state.nextId,
          text,
          timestamp,
          createdAt: now.toISOString(),
          audioLengthSeconds,
        },
      ],
      nextId: state.nextId + 1,
    }))
  },

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  updateEntryText: (id, text) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, text } : e)),
    })),

  clearAll: () => set({ entries: [], nextId: 1 }),

  getFullTranscript: () => {
    return get()
      .entries.map((e) => e.text)
      .join('\n')
  },
}))

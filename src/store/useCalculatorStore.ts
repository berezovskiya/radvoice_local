import { create } from 'zustand'
import type { CalculatorDefinition, CalculatorResult } from '../types/calculator'

interface CalculatorState {
  /** Currently open calculator (null = modal closed) */
  activeCalculator: CalculatorDefinition | null
  /** User selections keyed by criterion id */
  selections: Record<string, string | string[]>
  /** Computed result (null = incomplete) */
  result: CalculatorResult | null

  // Actions
  openCalculator: (calc: CalculatorDefinition) => void
  closeCalculator: () => void
  setSelection: (criterionId: string, value: string | string[]) => void
  resetSelections: () => void
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  activeCalculator: null,
  selections: {},
  result: null,

  openCalculator(calc) {
    set({ activeCalculator: calc, selections: {}, result: null })
  },

  closeCalculator() {
    set({ activeCalculator: null, selections: {}, result: null })
  },

  setSelection(criterionId, value) {
    const { activeCalculator, selections } = get()
    const next = { ...selections, [criterionId]: value }
    const result = activeCalculator?.score(next) ?? null
    set({ selections: next, result })
  },

  resetSelections() {
    set({ selections: {}, result: null })
  },
}))

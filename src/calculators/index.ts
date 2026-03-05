import type { CalculatorDefinition } from '../types/calculator'
import { piradsCalculator } from './pirads'
import { tiradsCalculator } from './tirads'
import { biradsCalculator } from './birads'
import { bosniakCalculator } from './bosniak'

// ---------------------------------------------------------------------------
// Calculator Registry
// ---------------------------------------------------------------------------

export const ALL_CALCULATORS: CalculatorDefinition[] = [
  piradsCalculator,
  tiradsCalculator,
  biradsCalculator,
  bosniakCalculator,
]

/** Look up a calculator by id */
export function getCalculatorById(id: string): CalculatorDefinition | undefined {
  return ALL_CALCULATORS.find((c) => c.id === id)
}

/**
 * Return calculators relevant to a given modality + body part.
 * Both params are optional — omit to get all.
 */
export function getCalculatorsForContext(
  modality?: string,
  bodyPart?: string,
): CalculatorDefinition[] {
  return ALL_CALCULATORS.filter((c) => {
    if (modality && !c.modality.includes(modality)) return false
    if (bodyPart && !c.bodyPart.includes(bodyPart)) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// Calculator Types — shared across all classification calculators
// ---------------------------------------------------------------------------

/** A single option within a criterion (e.g. "Hypoechoic — 2 pts") */
export interface CriterionOption {
  id: string
  label: string          // Ukrainian UI label
  points?: number        // for point-based systems (TI-RADS)
  value?: string         // for rule-based systems (PI-RADS, Bosniak)
}

/** A scoring criterion / category the user must fill in */
export interface CalculatorCriterion {
  id: string
  title: string          // Ukrainian
  description?: string   // optional helper text
  options: CriterionOption[]
  multiSelect?: boolean  // true = checkboxes (e.g. TI-RADS echogenic foci)
}

/** Result produced by the scoring function */
export interface CalculatorResult {
  category: string       // e.g. "PI-RADS 4", "TR3", "Bosniak IIF"
  label: string          // human-readable Ukrainian label
  description: string    // short explanation
  malignancyRate?: string
  management: string     // recommended action (Ukrainian)
  reportText: string     // ready-to-insert text for the report
}

/** Full calculator definition */
export interface CalculatorDefinition {
  id: string
  name: string           // short name: "PI-RADS v2.1"
  fullName: string       // full Ukrainian title
  citation: string       // academic reference
  modality: string[]     // e.g. ['MRI'] or ['CT','MRI']
  bodyPart: string[]     // e.g. ['prostate'] or ['kidney']
  criteria: CalculatorCriterion[]
  /** Pure scoring function: selections → result (or null if incomplete) */
  score: (selections: Record<string, string | string[]>) => CalculatorResult | null
}

import type { CalculatorCriterion } from '../../types/calculator'
import { useCalculatorStore } from '../../store/useCalculatorStore'

/** Renders all criteria for the active calculator */
export default function CalculatorForm() {
  const { activeCalculator, selections, setSelection } = useCalculatorStore()
  if (!activeCalculator) return null

  return (
    <div className="space-y-4">
      {activeCalculator.criteria.map((criterion) => (
        <CriterionField
          key={criterion.id}
          criterion={criterion}
          value={selections[criterion.id]}
          onChange={(val) => setSelection(criterion.id, val)}
        />
      ))}
    </div>
  )
}

function CriterionField({
  criterion,
  value,
  onChange,
}: {
  criterion: CalculatorCriterion
  value: string | string[] | undefined
  onChange: (val: string | string[]) => void
}) {
  const isMulti = criterion.multiSelect

  const handleSingle = (optionId: string) => {
    onChange(optionId)
  }

  const handleMulti = (optionId: string, checked: boolean) => {
    const current = Array.isArray(value) ? value : value ? [value] : []
    // "none" is exclusive — if selected, clear others; if other selected, remove "none"
    if (optionId === 'none') {
      onChange(checked ? ['none'] : [])
    } else {
      const without = current.filter((v) => v !== 'none' && v !== optionId)
      onChange(checked ? [...without, optionId] : without)
    }
  }

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-gray-300 mb-1.5">
        {criterion.title}
      </legend>
      {criterion.description && (
        <p className="text-[10px] text-gray-500 mb-1">{criterion.description}</p>
      )}

      <div className="space-y-0.5">
        {criterion.options.map((opt) => {
          const selected = isMulti
            ? (Array.isArray(value) ? value : value ? [value] : []).includes(opt.id)
            : value === opt.id

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                selected
                  ? 'bg-accent-blue/10 ring-1 ring-accent-blue/30'
                  : 'hover:bg-surface-4'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={criterion.id}
                checked={selected}
                onChange={(e) =>
                  isMulti
                    ? handleMulti(opt.id, e.target.checked)
                    : handleSingle(opt.id)
                }
                className="mt-0.5 accent-accent-blue"
              />
              <span className="text-xs text-gray-300 leading-snug">
                {opt.label}
                {opt.points !== undefined && (
                  <span className="text-gray-500 ml-1">({opt.points} б.)</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

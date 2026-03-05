import { useCalculatorStore } from '../../store/useCalculatorStore'
import { ALL_CALCULATORS } from '../../calculators'
import CalculatorForm from './CalculatorForm'
import CalculatorResultCard from './CalculatorResultCard'
import type { CalculatorDefinition } from '../../types/calculator'

interface Props {
  isOpen: boolean
  onClose: () => void
  onInsert: (text: string) => void
}

export default function CalculatorModal({ isOpen, onClose, onInsert }: Props) {
  const { activeCalculator, result, openCalculator, closeCalculator, resetSelections } =
    useCalculatorStore()

  if (!isOpen) return null

  const handleClose = () => {
    closeCalculator()
    onClose()
  }

  const handleInsert = (text: string) => {
    onInsert(text)
    handleClose()
  }

  const handleSelectCalculator = (calc: CalculatorDefinition) => {
    openCalculator(calc)
  }

  const handleBack = () => {
    closeCalculator()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-2 border border-border-default rounded-xl w-[520px] max-h-[85vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            {activeCalculator && (
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-300 transition-colors mr-1"
                title="Назад до списку"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <h2 className="text-sm font-semibold text-gray-200">
              {activeCalculator ? activeCalculator.name : 'Калькулятори'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
          >
            &#10005;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!activeCalculator ? (
            <CalculatorList onSelect={handleSelectCalculator} />
          ) : (
            <div className="space-y-4">
              {/* Citation */}
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {activeCalculator.citation}
              </p>

              <CalculatorForm />

              {result && (
                <CalculatorResultCard result={result} onInsert={handleInsert} />
              )}

              {/* Reset */}
              <button
                onClick={resetSelections}
                className="text-[10px] text-gray-500 hover:text-gray-400 underline"
              >
                Скинути
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Grid of available calculators */
function CalculatorList({ onSelect }: { onSelect: (c: CalculatorDefinition) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ALL_CALCULATORS.map((calc) => (
        <button
          key={calc.id}
          onClick={() => onSelect(calc)}
          className="text-left p-3 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border-subtle hover:border-accent-blue/30 transition-all group"
        >
          <p className="text-sm font-semibold text-gray-200 group-hover:text-accent-blue transition-colors">
            {calc.name}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 leading-snug">
            {calc.modality.join(', ')} · {calc.bodyPart.join(', ')}
          </p>
        </button>
      ))}
    </div>
  )
}

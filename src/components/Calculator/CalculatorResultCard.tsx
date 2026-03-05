import type { CalculatorResult } from '../../types/calculator'

interface Props {
  result: CalculatorResult
  onInsert: (text: string) => void
}

export default function CalculatorResultCard({ result, onInsert }: Props) {
  return (
    <div className="rounded-lg border border-accent-orange/40 bg-accent-orange/5 p-3 space-y-2">
      {/* Category badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent-orange/20 text-accent-orange">
          {result.category}
        </span>
        {result.malignancyRate && (
          <span className="text-[10px] text-gray-400">
            Малігнізація: {result.malignancyRate}
          </span>
        )}
      </div>

      {/* Label + description */}
      <p className="text-sm font-medium text-gray-200">{result.label}</p>
      <p className="text-xs text-gray-400">{result.description}</p>

      {/* Management */}
      <div className="text-xs text-gray-300">
        <span className="text-gray-500">Рекомендація:</span> {result.management}
      </div>

      {/* Insert button */}
      <button
        onClick={() => onInsert(result.reportText)}
        className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 transition-colors"
      >
        Вставити у звіт
      </button>
    </div>
  )
}

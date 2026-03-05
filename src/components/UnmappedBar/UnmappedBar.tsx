import { useMappingStore } from '../../store/useMappingStore'

export default function UnmappedBar() {
  const { getUnmappedFragments, mappingResult } = useMappingStore()
  const fragments = getUnmappedFragments()
  const hasMapping = mappingResult !== null

  if (!hasMapping) {
    return (
      <div className="px-4 py-2 bg-trace-unmapped/40 border-t border-accent-orange/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-accent-orange uppercase tracking-wider">
            Невикористаний текст
          </span>
          <span className="text-xs text-orange-400/60">
            — фрагменти диктовки, не розміщені в шаблоні
          </span>
        </div>
        <p className="text-sm text-orange-300/40 italic mt-1">
          Поки немає невикористаних фрагментів
        </p>
      </div>
    )
  }

  if (fragments.length === 0) {
    return (
      <div className="px-4 py-2 bg-accent-green/10 border-t border-accent-green/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-accent-green uppercase tracking-wider">
            Весь текст розподілено
          </span>
          <span className="text-xs text-green-400/60">
            — всі фрагменти диктовки прив'язані до секцій
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 bg-trace-unmapped/40 border-t border-accent-orange/20 max-h-32 overflow-y-auto">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-accent-orange uppercase tracking-wider">
          Невикористаний текст
        </span>
        <span className="text-xs text-orange-400/60">
          — {fragments.length} {fragments.length === 1 ? 'фрагмент' : 'фрагментів'}
        </span>
      </div>
      <div className="space-y-1">
        {fragments.map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-sm text-orange-300/80">&laquo;{f.text}&raquo;</span>
            {f.reason && (
              <span className="text-[10px] text-orange-400/50 shrink-0">
                ({f.reason})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

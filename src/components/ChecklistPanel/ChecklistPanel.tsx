import { useMemo } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useDictationStore } from '../../store/useDictationStore'
import { useMappingStore } from '../../store/useMappingStore'
import type { ChecklistItem } from '../../types/template'

/**
 * Check which checklist items are covered by matching keywords
 * against the full transcript + mapping result texts.
 */
function useChecklistStatus(checklist: ChecklistItem[]) {
  const { getFullTranscript } = useDictationStore()
  const { mappingResult } = useMappingStore()

  return useMemo(() => {
    // Build a combined text corpus: raw transcript + only REPLACED section texts
    // (skip default/unchanged texts to avoid false positives from template placeholders)
    let corpus = getFullTranscript().toLowerCase()

    if (mappingResult) {
      for (const update of mappingResult.sectionUpdates) {
        if (update.action === 'replaced' && update.newText) {
          corpus += ' ' + update.newText.toLowerCase()
        }
        for (const frag of update.sourceFragments ?? []) {
          if (frag.text) corpus += ' ' + frag.text.toLowerCase()
        }
      }
    }

    const results = new Map<string, boolean>()
    for (const item of checklist) {
      const matched = item.keywords.some((kw) => corpus.includes(kw.toLowerCase()))
      results.set(item.id, matched)
    }
    return results
  }, [checklist, getFullTranscript, mappingResult])
}

export default function ChecklistPanel() {
  const { selectedTemplate } = useTemplateStore()
  const checklist = selectedTemplate?.checklist ?? []
  const status = useChecklistStatus(checklist)

  if (checklist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p className="text-xs text-center px-4">
          Для цього шаблону чекліст не налаштований
        </p>
      </div>
    )
  }

  // Group by category
  const categories = new Map<string, ChecklistItem[]>()
  for (const item of checklist) {
    const cat = item.category
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(item)
  }

  const total = checklist.length
  const checked = [...status.values()].filter(Boolean).length
  const pct = Math.round((checked / total) * 100)

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 bg-surface-2 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Чекліст
          </h2>
          <span className={`text-xs font-medium ${pct === 100 ? 'text-accent-green' : 'text-gray-500'}`}>
            {checked}/{total} ({pct}%)
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-1.5 h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100 ? 'bg-accent-green' : pct > 50 ? 'bg-accent-blue' : 'bg-accent-orange'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll p-2 space-y-3">
        {[...categories.entries()].map(([cat, items]) => (
          <div key={cat}>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
              {cat}
            </h3>
            <div className="space-y-0.5">
              {items.map((item) => {
                const done = status.get(item.id) ?? false
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2 px-2 py-1 rounded text-xs transition-colors ${
                      done ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${done ? 'text-accent-green' : 'text-gray-600'}`}>
                      {done ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={done ? '' : 'opacity-70'}>{item.item}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

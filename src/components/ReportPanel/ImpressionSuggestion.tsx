import { useState, useRef, useEffect, useCallback } from 'react'
import { useMappingStore } from '../../store/useMappingStore'

function AutoResizeTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => { resize() }, [value, resize])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      rows={2}
      className="w-full resize-none bg-surface-3/50 border border-accent-orange/30 rounded p-2 text-sm text-gray-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent-orange/50"
    />
  )
}

export default function ImpressionSuggestion() {
  const {
    impressionSuggestion,
    isGeneratingImpression,
    impressionError,
    acceptImpression,
    dismissImpression,
  } = useMappingStore()

  const [editedText, setEditedText] = useState('')

  // Sync editedText when suggestion arrives
  useEffect(() => {
    if (impressionSuggestion) setEditedText(impressionSuggestion)
  }, [impressionSuggestion])

  if (isGeneratingImpression) {
    return (
      <div className="mt-2 p-3 border border-accent-orange/20 rounded-lg bg-accent-orange/5 animate-pulse">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 animate-spin text-accent-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-xs text-accent-orange/80">Генерація висновку...</span>
        </div>
      </div>
    )
  }

  if (impressionError) {
    return (
      <div className="mt-2 p-3 border border-accent-red/20 rounded-lg bg-accent-red/5">
        <p className="text-xs text-accent-red mb-1">Помилка генерації висновку</p>
        <p className="text-xs text-gray-500">{impressionError}</p>
        <button
          onClick={dismissImpression}
          className="mt-2 text-[10px] px-2 py-1 rounded bg-surface-3 text-gray-400 hover:text-gray-200 transition-colors"
        >
          Закрити
        </button>
      </div>
    )
  }

  if (!impressionSuggestion) return null

  const handleAccept = () => {
    // Update the suggestion text in store before accepting (in case user edited)
    useMappingStore.setState({ impressionSuggestion: editedText })
    // Small delay to let state update
    setTimeout(() => acceptImpression(), 0)
  }

  return (
    <div className="mt-2 p-3 border border-accent-orange/30 rounded-lg bg-accent-orange/5">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-3.5 h-3.5 text-accent-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-xs font-medium text-accent-orange/90">Запропонований висновок</span>
      </div>

      <AutoResizeTextarea value={editedText} onChange={setEditedText} />

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleAccept}
          className="text-[11px] px-3 py-1.5 rounded-md bg-accent-green/15 text-accent-green hover:bg-accent-green/25 transition-colors font-medium"
        >
          Прийняти
        </button>
        <button
          onClick={dismissImpression}
          className="text-[11px] px-3 py-1.5 rounded-md bg-surface-3 text-gray-400 hover:text-gray-200 transition-colors"
        >
          Відхилити
        </button>
      </div>
    </div>
  )
}

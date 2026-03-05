import { useState, useEffect, useMemo } from 'react'
import type { DicomStudy } from '../../types/electron'

interface StudyPickerProps {
  onSelect: (study: DicomStudy) => void
}

export default function StudyPicker({ onSelect }: StudyPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [studies, setStudies] = useState<DicomStudy[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadStudies = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.scanStudies()
      setStudies(result)
      if (result.length === 0) {
        setError('Досліджень не знайдено. Перевірте шлях до Horos у налаштуваннях.')
      }
    } catch (err) {
      setError(`Помилка: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && studies.length === 0 && !loading) {
      loadStudies()
    }
  }, [isOpen])

  const filtered = useMemo(() => {
    if (!search.trim()) return studies
    const q = search.toLowerCase()
    return studies.filter(
      (s) =>
        s.patientName.toLowerCase().includes(q) ||
        s.patientId.toLowerCase().includes(q) ||
        s.studyDate.includes(q) ||
        s.modality.toLowerCase().includes(q) ||
        s.studyDescription.toLowerCase().includes(q),
    )
  }, [studies, search])

  const handleSelect = (study: DicomStudy) => {
    onSelect(study)
    setIsOpen(false)
  }

  return (
    <div className="border-b border-border-subtle">
      {/* Toggle bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-surface-3/50 transition-colors group"
      >
        {/* Horos icon */}
        <svg
          className="w-4 h-4 text-accent-orange shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <circle cx="12" cy="12" r="4" />
          <path d="M2 7h20" />
        </svg>
        <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
          Обрати пацієнта з Horos
        </span>
        <svg
          className={`w-3 h-3 text-gray-500 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable study list */}
      {isOpen && (
        <div className="border-t border-border-subtle bg-surface-0/50">
          {/* Search + refresh bar */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук за ПІБ, ID, датою..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-3 border border-border-default rounded-md text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                autoFocus
              />
            </div>
            <button
              onClick={loadStudies}
              disabled={loading}
              title="Оновити список"
              className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-surface-3 rounded-md transition-colors disabled:opacity-30"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-9-9" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </button>
          </div>

          {/* Study list */}
          <div className="max-h-56 overflow-y-auto">
            {loading && studies.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">Завантаження...</p>
            )}

            {error && (
              <p className="text-xs text-accent-red text-center py-4 px-4">{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && studies.length > 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                Нічого не знайдено
              </p>
            )}

            {filtered.map((study) => (
              <button
                key={study.id}
                onClick={() => handleSelect(study)}
                className="w-full text-left px-4 py-2 hover:bg-accent-blue/10 border-b border-border-subtle/50 last:border-b-0 transition-colors group"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-gray-200 group-hover:text-accent-blue transition-colors truncate">
                    {study.patientName || '(без імені)'}
                  </span>
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {study.studyDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-gray-500">
                    ID: {study.patientId || '—'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {study.modality}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    {study.studyDescription}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Count */}
          {studies.length > 0 && (
            <div className="px-4 py-1.5 border-t border-border-subtle/50">
              <span className="text-[10px] text-gray-600">
                {filtered.length} з {studies.length} досліджень
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

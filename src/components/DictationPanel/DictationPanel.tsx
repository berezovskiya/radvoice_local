import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useDictationStore } from '../../store/useDictationStore'
import { useMappingStore } from '../../store/useMappingStore'
import type { DictationEntry } from '../../types/dictation'

type MarkType = 'hover' | 'unmapped'

interface MarkedRange {
  start: number
  end: number
  type: MarkType
}

/**
 * Build character ranges to highlight in the full transcript:
 * - hover (blue): source fragments of the currently hovered report section
 * - unmapped (orange): permanently shown for unmapped fragments
 */
function useMarkedRanges(): MarkedRange[] {
  const { hoveredSectionId, mappingResult } = useMappingStore()

  return useMemo(() => {
    if (!mappingResult) return []

    const ranges: MarkedRange[] = []

    // Always show unmapped fragments in orange
    for (const f of mappingResult.unmappedFragments) {
      ranges.push({ start: f.startChar, end: f.endChar, type: 'unmapped' })
    }

    // Show hovered section's source fragments in blue
    if (hoveredSectionId) {
      const update = mappingResult.sectionUpdates.find(
        (u) => u.sectionId === hoveredSectionId,
      )
      if (update?.sourceFragments) {
        for (const f of update.sourceFragments) {
          ranges.push({ start: f.startChar, end: f.endChar, type: 'hover' })
        }
      }
    }

    return ranges
  }, [hoveredSectionId, mappingResult])
}

const MARK_STYLES: Record<MarkType, string> = {
  hover: 'bg-accent-blue/20 text-gray-100 rounded px-0.5 ring-1 ring-accent-blue/30',
  unmapped: 'bg-accent-orange/10 text-orange-300/90 border-b-2 border-accent-orange/40 border-dashed',
}

/**
 * Renders text with colored marks for matched ranges.
 * Hover ranges take priority over unmapped ranges when they overlap.
 */
function HighlightedText({
  text,
  charOffset,
  ranges,
}: {
  text: string
  charOffset: number
  ranges: MarkedRange[]
}) {
  if (ranges.length === 0) {
    return <span>{text}</span>
  }

  // Convert global ranges to local, filter to this text block
  const localRanges = ranges
    .map((r) => ({
      start: Math.max(0, r.start - charOffset),
      end: Math.min(text.length, r.end - charOffset),
      type: r.type,
    }))
    .filter((r) => r.start < r.end && r.start < text.length && r.end > 0)

  if (localRanges.length === 0) {
    return <span>{text}</span>
  }

  // Build a per-character type map; hover takes priority over unmapped
  const charTypes: (MarkType | null)[] = new Array(text.length).fill(null)

  // First pass: unmapped
  for (const r of localRanges) {
    if (r.type === 'unmapped') {
      for (let i = r.start; i < r.end; i++) charTypes[i] = 'unmapped'
    }
  }
  // Second pass: hover overrides
  for (const r of localRanges) {
    if (r.type === 'hover') {
      for (let i = r.start; i < r.end; i++) charTypes[i] = 'hover'
    }
  }

  // Build spans by grouping consecutive chars with the same type
  const parts: JSX.Element[] = []
  let runStart = 0
  let runType = charTypes[0]

  for (let i = 1; i <= text.length; i++) {
    const currentType = i < text.length ? charTypes[i] : null
    if (currentType !== runType || i === text.length) {
      const slice = text.slice(runStart, i)
      if (runType) {
        parts.push(
          <mark key={runStart} className={MARK_STYLES[runType]}>
            {slice}
          </mark>,
        )
      } else {
        parts.push(<span key={runStart}>{slice}</span>)
      }
      runStart = i
      runType = currentType
    }
  }

  return <>{parts}</>
}

function EntryBlock({
  entry,
  index,
  total,
  charOffset,
  markedRanges,
  onRemove,
  onUpdateText,
}: {
  entry: DictationEntry
  index: number
  total: number
  charOffset: number
  markedRanges: MarkedRange[]
  onRemove: (id: number) => void
  onUpdateText: (id: number, text: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(entry.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const ta = textareaRef.current
      ta.focus()
      ta.selectionStart = ta.selectionEnd = ta.value.length
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [isEditing])

  const startEditing = useCallback(() => {
    setEditText(entry.text)
    setIsEditing(true)
  }, [entry.text])

  const commitEdit = useCallback(() => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== entry.text) {
      onUpdateText(entry.id, trimmed)
    }
    setIsEditing(false)
  }, [editText, entry.id, entry.text, onUpdateText])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelEdit()
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        commitEdit()
      }
    },
    [cancelEdit, commitEdit],
  )

  return (
    <div className="group relative">
      {index > 0 && (
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-border-default" />
          <span className="text-[10px] text-gray-500 shrink-0">
            Диктовка #{index + 1} — {entry.timestamp}
          </span>
          <div className="flex-1 h-px bg-border-default" />
        </div>
      )}
      {index === 0 && total > 1 && (
        <div className="mb-2">
          <span className="text-[10px] text-gray-500">
            Диктовка #1 — {entry.timestamp}
          </span>
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-gray-300 leading-relaxed bg-surface-3 border border-accent-blue/40 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            Ctrl+Enter — зберегти &middot; Esc — скасувати
          </p>
        </div>
      ) : (
        <div
          className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap cursor-text"
          onDoubleClick={startEditing}
          title="Подвійний клік для редагування"
        >
          <HighlightedText
            text={entry.text}
            charOffset={charOffset}
            ranges={markedRanges}
          />
        </div>
      )}

      <div className="flex justify-end mt-1 gap-1">
        {!isEditing && (
          <button
            onClick={startEditing}
            className="text-gray-600 hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100 p-0.5"
            title="Редагувати запис"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => onRemove(entry.id)}
          className="text-gray-600 hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100 p-0.5"
          title="Видалити запис"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function DictationPanel() {
  const { entries, isRecording, isTranscribing, clearAll, removeEntry, updateEntryText } = useDictationStore()
  const hasEntries = entries.length > 0
  const markedRanges = useMarkedRanges()

  // Calculate character offsets for each entry in the full transcript
  // Full transcript = entries joined by '\n'
  const charOffsets = useMemo(() => {
    const offsets: number[] = []
    let offset = 0
    entries.forEach((entry, i) => {
      offsets.push(offset)
      offset += entry.text.length
      if (i < entries.length - 1) offset += 1 // '\n' separator
    })
    return offsets
  }, [entries])

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 bg-surface-2 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Диктовка
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {entries.length} {entries.length === 1 ? 'запис' : 'записів'}
            </span>
            {hasEntries && (
              <button
                onClick={clearAll}
                className="text-[10px] text-gray-500 hover:text-accent-red transition-colors"
                title="Очистити все"
              >
                &#10005;
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll p-3">
        {isTranscribing ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-3 animate-spin">&#9881;</div>
              <p className="text-sm">Транскрипція...</p>
              <p className="text-xs text-gray-600 mt-1">Whisper Large v3 обробляє аудіо</p>
            </div>
          </div>
        ) : isRecording ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-4 h-4 bg-accent-red rounded-full mx-auto mb-3 animate-pulse" />
              <p className="text-sm text-accent-red font-medium">Запис...</p>
              <p className="text-xs text-gray-500 mt-1">Говоріть чітко в мікрофон</p>
            </div>
          </div>
        ) : hasEntries ? (
          <div className="space-y-1">
            {entries.map((entry, i) => (
              <EntryBlock
                key={entry.id}
                entry={entry}
                index={i}
                total={entries.length}
                charOffset={charOffsets[i]}
                markedRanges={markedRanges}
                onRemove={removeEntry}
                onUpdateText={updateEntryText}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-20">&#127908;</div>
              <p className="text-sm">
                Натисніть &laquo;Запис&raquo; для початку
                <br />
                голосової диктовки
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

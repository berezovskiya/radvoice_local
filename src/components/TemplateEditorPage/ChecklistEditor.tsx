import { useMemo } from 'react'
import type { ChecklistItem } from '../../types/template'

interface ChecklistEditorProps {
  checklist: ChecklistItem[]
  onChange: (checklist: ChecklistItem[]) => void
}

function uid() {
  return `cl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function KeywordsPills({
  keywords,
  onChange,
}: {
  keywords: string[]
  onChange: (keywords: string[]) => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.currentTarget.value.trim()
      if (val && !keywords.includes(val)) {
        onChange([...keywords, val])
      }
      e.currentTarget.value = ''
    }
  }

  const removeKeyword = (idx: number) => {
    onChange(keywords.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {keywords.map((kw, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-accent-blue/15 text-accent-blue text-[10px] rounded"
        >
          {kw}
          <button
            onClick={() => removeKeyword(i)}
            className="text-accent-blue/60 hover:text-accent-blue ml-0.5"
          >
            &#10005;
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder="+ ключове слово"
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[80px] px-1 py-0.5 bg-transparent text-[10px] text-gray-400 placeholder:text-gray-600 focus:outline-none"
      />
    </div>
  )
}

function ChecklistItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ChecklistItem
  onUpdate: (item: ChecklistItem) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="flex-1 space-y-1">
        <input
          type="text"
          value={item.item}
          onChange={(e) => onUpdate({ ...item, item: e.target.value })}
          placeholder="Текст елемента чекліста"
          className="w-full px-2 py-1 bg-surface-3 border border-border-default rounded text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        <KeywordsPills
          keywords={item.keywords}
          onChange={(keywords) => onUpdate({ ...item, keywords })}
        />
      </div>
      <button
        onClick={onRemove}
        className="text-gray-600 hover:text-accent-red transition-colors p-0.5 shrink-0 mt-1"
        title="Видалити елемент"
      >
        &#10005;
      </button>
    </div>
  )
}

export default function ChecklistEditor({ checklist, onChange }: ChecklistEditorProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>()
    for (const item of checklist) {
      const cat = item.category || 'Без категорії'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(item)
    }
    return map
  }, [checklist])

  const updateItem = (id: string, updated: ChecklistItem) => {
    onChange(checklist.map((item) => (item.id === id ? updated : item)))
  }

  const removeItem = (id: string) => {
    onChange(checklist.filter((item) => item.id !== id))
  }

  const addItemToCategory = (category: string) => {
    onChange([...checklist, { id: uid(), category, item: '', keywords: [] }])
  }

  const addNewCategory = () => {
    const name = window.prompt('Назва нової категорії:')
    if (!name?.trim()) return
    onChange([...checklist, { id: uid(), category: name.trim(), item: '', keywords: [] }])
  }

  const renameCategory = (oldName: string) => {
    const newName = window.prompt('Нова назва категорії:', oldName)
    if (!newName?.trim() || newName.trim() === oldName) return
    onChange(
      checklist.map((item) =>
        item.category === oldName ? { ...item, category: newName.trim() } : item
      )
    )
  }

  return (
    <div className="bg-surface-2 border border-border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Чекліст
        </h3>
        <button
          onClick={addNewCategory}
          className="text-[11px] text-accent-blue hover:text-blue-400 transition-colors"
        >
          + Нова категорія
        </button>
      </div>

      {grouped.size === 0 && (
        <p className="text-xs text-gray-600 py-2">
          Чекліст порожній. Додайте категорію для початку.
        </p>
      )}

      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => renameCategory(category)}
                className="text-xs font-medium text-gray-300 hover:text-gray-100 transition-colors"
                title="Перейменувати категорію"
              >
                {category}
              </button>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            <div className="ml-3 border-l-2 border-border-subtle pl-3 space-y-0.5">
              {items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(updated) => updateItem(item.id, updated)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
              <button
                onClick={() => addItemToCategory(category)}
                className="text-[11px] text-accent-blue hover:text-blue-400 transition-colors py-1"
              >
                + Додати елемент
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

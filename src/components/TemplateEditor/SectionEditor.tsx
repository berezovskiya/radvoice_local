import type { TemplateSection, TemplateSubsection } from '../../types/template'

interface SectionEditorProps {
  sections: TemplateSection[]
  onChange: (sections: TemplateSection[]) => void
}

function uid() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function SubsectionRow({
  sub,
  onUpdate,
  onRemove,
}: {
  sub: TemplateSubsection
  onUpdate: (sub: TemplateSubsection) => void
  onRemove: () => void
}) {
  return (
    <div className="ml-5 pl-3 border-l-2 border-border-subtle space-y-1.5 py-2">
      <div className="flex items-center gap-2">
        <input
          value={sub.title}
          onChange={(e) => onUpdate({ ...sub, title: e.target.value })}
          placeholder="Назва підсекції"
          className="flex-1 px-2 py-1 bg-surface-3 border border-border-default rounded text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-accent-red transition-colors p-0.5 shrink-0"
          title="Видалити підсекцію"
        >
          &#10005;
        </button>
      </div>
      <textarea
        value={sub.defaultText}
        onChange={(e) => onUpdate({ ...sub, defaultText: e.target.value })}
        placeholder="Текст за замовчуванням"
        rows={2}
        className="w-full px-2 py-1 bg-surface-3 border border-border-default rounded text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue resize-y"
      />
      <textarea
        value={sub.normalText ?? ''}
        onChange={(e) => onUpdate({ ...sub, normalText: e.target.value || undefined })}
        placeholder="Текст норми (необов'язково — якщо порожнє, буде використано текст за замовчуванням)"
        rows={2}
        className="w-full px-2 py-1 bg-surface-3 border border-accent-green/20 rounded text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-green resize-y"
      />
    </div>
  )
}

function SectionRow({
  section,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: TemplateSection
  index: number
  total: number
  onUpdate: (section: TemplateSection) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const isGroup = section.type === 'group'

  const updateSubsection = (subIndex: number, sub: TemplateSubsection) => {
    const subs = [...(section.subsections || [])]
    subs[subIndex] = sub
    onUpdate({ ...section, subsections: subs })
  }

  const removeSubsection = (subIndex: number) => {
    const subs = (section.subsections || []).filter((_, i) => i !== subIndex)
    onUpdate({ ...section, subsections: subs })
  }

  const addSubsection = () => {
    const subs = [...(section.subsections || [])]
    subs.push({ id: uid(), title: '', defaultText: '' })
    onUpdate({ ...section, subsections: subs })
  }

  return (
    <div className="bg-surface-2 border border-border-default rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-[10px] text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-default"
          >
            &#9650;
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-[10px] text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-default"
          >
            &#9660;
          </button>
        </div>

        <input
          value={section.title}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          placeholder="Назва секції"
          className="flex-1 px-2 py-1.5 bg-surface-3 border border-border-default rounded text-xs font-medium text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />

        <select
          value={section.type}
          onChange={(e) => {
            const newType = e.target.value as 'free_text' | 'group'
            const updated: TemplateSection = { ...section, type: newType }
            if (newType === 'group' && !updated.subsections) {
              updated.subsections = []
            }
            if (newType === 'free_text') {
              delete updated.subsections
            }
            onUpdate(updated)
          }}
          className="px-2 py-1.5 bg-surface-3 border border-border-default rounded text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent-blue"
        >
          <option value="free_text">free_text</option>
          <option value="group">group</option>
        </select>

        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-accent-red transition-colors p-1 shrink-0"
          title="Видалити секцію"
        >
          &#10005;
        </button>
      </div>

      {!isGroup && (
        <>
          <textarea
            value={section.defaultText ?? ''}
            onChange={(e) => onUpdate({ ...section, defaultText: e.target.value })}
            placeholder="Текст за замовчуванням"
            rows={2}
            className="w-full px-2 py-1 bg-surface-3 border border-border-default rounded text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue resize-y"
          />
          <textarea
            value={section.normalText ?? ''}
            onChange={(e) => onUpdate({ ...section, normalText: e.target.value || undefined })}
            placeholder="Текст норми (необов'язково — якщо порожнє, буде використано текст за замовчуванням)"
            rows={2}
            className="w-full px-2 py-1 bg-surface-3 border border-accent-green/20 rounded text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-green resize-y"
          />
          <input
            value={section.placeholder ?? ''}
            onChange={(e) => onUpdate({ ...section, placeholder: e.target.value || undefined })}
            placeholder="Placeholder (необов'язково)"
            className="w-full px-2 py-1 bg-surface-3 border border-border-default rounded text-xs text-gray-400 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </>
      )}

      {isGroup && (
        <div className="space-y-1">
          {(section.subsections || []).map((sub, si) => (
            <SubsectionRow
              key={sub.id}
              sub={sub}
              onUpdate={(s) => updateSubsection(si, s)}
              onRemove={() => removeSubsection(si)}
            />
          ))}
          <button
            onClick={addSubsection}
            className="ml-5 text-[11px] text-accent-blue hover:text-blue-400 transition-colors"
          >
            + Додати підсекцію
          </button>
        </div>
      )}
    </div>
  )
}

export default function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const updateSection = (index: number, section: TemplateSection) => {
    const updated = [...sections]
    updated[index] = section
    onChange(updated)
  }

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return
    const updated = [...sections]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated)
  }

  const addSection = () => {
    onChange([...sections, { id: uid(), title: '', type: 'free_text', defaultText: '' }])
  }

  return (
    <div className="space-y-2">
      {sections.map((section, i) => (
        <SectionRow
          key={section.id}
          section={section}
          index={i}
          total={sections.length}
          onUpdate={(s) => updateSection(i, s)}
          onRemove={() => removeSection(i)}
          onMoveUp={() => moveSection(i, i - 1)}
          onMoveDown={() => moveSection(i, i + 1)}
        />
      ))}
      <button
        onClick={addSection}
        className="w-full py-2 border border-dashed border-border-default rounded-lg text-xs text-gray-500 hover:text-accent-blue hover:border-accent-blue/40 transition-colors"
      >
        + Додати секцію
      </button>
    </div>
  )
}

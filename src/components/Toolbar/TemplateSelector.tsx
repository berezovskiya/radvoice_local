import { useEffect, useMemo } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useAppViewStore } from '../../store/useAppViewStore'

const MODALITY_LABELS: Record<string, string> = {
  CT: 'КТ',
  MRI: 'МРТ',
}

const MODALITY_ORDER = ['CT', 'MRI']

export default function TemplateSelector() {
  const { templateList, isLoadingList, selectedTemplate, fetchTemplateList, selectTemplate } =
    useTemplateStore()
  const openTemplateEditor = useAppViewStore((s) => s.openTemplateEditor)

  useEffect(() => {
    fetchTemplateList()
  }, [fetchTemplateList])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const file = e.target.value
    if (file) {
      selectTemplate(file)
    }
  }

  const selectedFile = templateList.find((t) => t.id === selectedTemplate?.id)?.file ?? ''

  const handleEditTemplates = () => {
    openTemplateEditor(selectedFile || null)
  }

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, typeof templateList> = {}
    for (const t of templateList) {
      const mod = t.modality || 'Інше'
      if (!groups[mod]) groups[mod] = []
      groups[mod].push(t)
    }
    // Sort groups by MODALITY_ORDER, then alphabetically
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ia = MODALITY_ORDER.indexOf(a)
      const ib = MODALITY_ORDER.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b)
    })
    return sortedKeys.map((mod) => ({
      modality: mod,
      label: MODALITY_LABELS[mod] || mod,
      templates: groups[mod].sort((a, b) => a.name.localeCompare(b.name, 'uk')),
    }))
  }, [templateList])

  return (
    <div className="flex items-center gap-1.5 no-drag">
      <select
        value={selectedFile}
        onChange={handleChange}
        disabled={isLoadingList}
        className="px-3 py-1.5 bg-surface-3 rounded-md text-sm text-gray-300 border border-border-default hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent min-w-[280px] cursor-pointer disabled:opacity-50"
      >
        <option value="">
          {isLoadingList ? 'Завантаження...' : 'Оберіть шаблон...'}
        </option>
        {groupedTemplates.map((group) => (
          <optgroup key={group.modality} label={group.label}>
            {group.templates.map((t) => (
              <option key={t.id} value={t.file}>
                {t.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <button
        onClick={handleEditTemplates}
        className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-md hover:bg-surface-3"
        title="Редагувати шаблони"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  )
}

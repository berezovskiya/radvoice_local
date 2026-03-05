import { useEffect } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useTemplateEditorStore } from '../../store/useTemplateEditorStore'

export default function TemplateListSidebar() {
  const { templateList, fetchTemplateList } = useTemplateStore()
  const { originalFileName, isDirty, loadExisting, initNew } = useTemplateEditorStore()

  useEffect(() => {
    fetchTemplateList()
  }, [fetchTemplateList])

  const handleSelect = (file: string) => {
    if (file === originalFileName) return
    if (isDirty && !window.confirm('Є незбережені зміни. Перейти до іншого шаблону?')) return
    loadExisting(file)
  }

  const handleNew = () => {
    if (isDirty && !window.confirm('Є незбережені зміни. Створити новий шаблон?')) return
    initNew()
  }

  return (
    <div className="w-[240px] shrink-0 bg-surface-2 border-r border-border-subtle flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Шаблони
        </span>
        <button
          onClick={handleNew}
          className="text-accent-blue hover:text-blue-400 transition-colors text-lg leading-none"
          title="Новий шаблон"
        >
          +
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto panel-scroll">
        {templateList.length === 0 && (
          <p className="text-xs text-gray-600 px-3 py-4">Шаблонів не знайдено</p>
        )}
        {templateList.map((t) => {
          const isActive = t.file === originalFileName
          return (
            <button
              key={t.file}
              onClick={() => handleSelect(t.file)}
              className={`w-full text-left px-3 py-2 border-b border-border-subtle transition-colors ${
                isActive
                  ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue'
                  : 'hover:bg-surface-3 border-l-2 border-l-transparent'
              }`}
            >
              <div className={`text-xs truncate ${isActive ? 'text-gray-100 font-medium' : 'text-gray-300'}`}>
                {t.name}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">{t.modality}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

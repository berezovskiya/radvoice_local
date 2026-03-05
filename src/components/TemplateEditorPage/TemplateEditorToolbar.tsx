import { useTemplateEditorStore } from '../../store/useTemplateEditorStore'
import { useAppViewStore } from '../../store/useAppViewStore'

export default function TemplateEditorToolbar() {
  const { draft, isDirty, originalFileName, save, deleteTemplate, duplicate, importFromFile, exportToFile, initNew } =
    useTemplateEditorStore()
  const closeTemplateEditor = useAppViewStore((s) => s.closeTemplateEditor)

  const handleBack = () => {
    if (isDirty && !window.confirm('Є незбережені зміни. Вийти без збереження?')) return
    closeTemplateEditor()
  }

  const handleNew = () => {
    if (isDirty && !window.confirm('Є незбережені зміни. Створити новий шаблон?')) return
    initNew()
  }

  const handleSave = () => {
    if (!draft.name.trim()) {
      window.alert('Вкажіть назву шаблону перед збереженням.')
      return
    }
    save()
  }

  return (
    <div className="flex items-center gap-2 pl-20 pr-4 py-2 bg-surface-2 border-b border-border-subtle app-drag-region">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-3 rounded-md transition-colors no-drag"
      >
        <span className="text-base">&#8592;</span>
        Назад
      </button>

      <div className="w-px h-6 bg-border-default mx-1" />

      {/* Template name */}
      <h2 className="text-sm font-medium text-gray-200 truncate max-w-[300px] no-drag">
        {draft.name || 'Новий шаблон'}
        {isDirty && <span className="text-accent-orange ml-1">*</span>}
      </h2>

      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={handleNew}
        className="px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 bg-surface-3 hover:bg-surface-4 border border-border-default rounded-md transition-colors no-drag"
      >
        Новий
      </button>

      <button
        onClick={duplicate}
        className="px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 bg-surface-3 hover:bg-surface-4 border border-border-default rounded-md transition-colors no-drag"
      >
        Дублювати
      </button>

      <button
        onClick={importFromFile}
        className="px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 bg-surface-3 hover:bg-surface-4 border border-border-default rounded-md transition-colors no-drag"
      >
        Імпорт
      </button>

      <button
        onClick={exportToFile}
        className="px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 bg-surface-3 hover:bg-surface-4 border border-border-default rounded-md transition-colors no-drag"
      >
        Експорт
      </button>

      <div className="w-px h-6 bg-border-default mx-1" />

      {originalFileName && (
        <button
          onClick={deleteTemplate}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-accent-red bg-surface-3 hover:bg-surface-4 border border-border-default rounded-md transition-colors no-drag"
        >
          Видалити
        </button>
      )}

      <button
        onClick={handleSave}
        className="px-4 py-1.5 text-xs font-medium text-white bg-accent-blue hover:bg-blue-600 rounded-md transition-colors no-drag"
      >
        Зберегти
      </button>
    </div>
  )
}

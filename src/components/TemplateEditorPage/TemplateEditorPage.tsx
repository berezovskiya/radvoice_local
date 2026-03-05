import { useEffect } from 'react'
import { useAppViewStore } from '../../store/useAppViewStore'
import { useTemplateEditorStore } from '../../store/useTemplateEditorStore'
import TemplateEditorToolbar from './TemplateEditorToolbar'
import TemplateListSidebar from './TemplateListSidebar'
import MetadataForm from './MetadataForm'
import SectionEditor from '../TemplateEditor/SectionEditor'
import ChecklistEditor from './ChecklistEditor'

export default function TemplateEditorPage() {
  const editingTemplateFile = useAppViewStore((s) => s.editingTemplateFile)
  const { draft, isLoading, loadExisting, initNew, updateMetadata, setSections, setChecklist } =
    useTemplateEditorStore()

  useEffect(() => {
    if (editingTemplateFile) {
      loadExisting(editingTemplateFile)
    } else {
      initNew()
    }
  }, [editingTemplateFile, loadExisting, initNew])

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <TemplateEditorToolbar />

      <div className="flex-1 flex overflow-hidden">
        <TemplateListSidebar />

        <div className="flex-1 overflow-y-auto panel-scroll p-6 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-gray-500 animate-pulse">Завантаження...</span>
            </div>
          ) : (
            <>
              <MetadataForm
                metadata={{
                  name: draft.name,
                  modality: draft.modality,
                  bodyPart: draft.bodyPart,
                  language: draft.language,
                  version: draft.version,
                }}
                onChange={updateMetadata}
              />

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Секції шаблону
                </h3>
                <SectionEditor sections={draft.sections} onChange={setSections} />
              </div>

              <ChecklistEditor
                checklist={draft.checklist ?? []}
                onChange={setChecklist}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

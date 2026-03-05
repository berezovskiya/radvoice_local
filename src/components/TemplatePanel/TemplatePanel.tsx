import { useTemplateStore } from '../../store/useTemplateStore'
import type { TemplateSection, TemplateSubsection } from '../../types/template'

function SubsectionBlock({ sub }: { sub: TemplateSubsection }) {
  return (
    <div className="p-2 bg-surface-3/50 rounded border border-border-subtle">
      <h4 className="text-xs font-medium text-gray-400">{sub.title}</h4>
      <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{sub.defaultText}</p>
    </div>
  )
}

function SectionBlock({ section }: { section: TemplateSection }) {
  const isGroup = section.type === 'group' && section.subsections

  return (
    <div className="p-3 bg-surface-2 rounded-lg border border-border-subtle">
      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">
        {section.title}
      </h3>

      {isGroup ? (
        <div className="ml-1 mt-2 space-y-2">
          {section.subsections!.map((sub) => (
            <SubsectionBlock key={sub.id} sub={sub} />
          ))}
        </div>
      ) : section.defaultText ? (
        <p className="text-sm text-gray-300 leading-relaxed">{section.defaultText}</p>
      ) : (
        <p className="text-sm text-gray-500 italic">
          {section.placeholder ?? '—'}
        </p>
      )}
    </div>
  )
}

export default function TemplatePanel() {
  const { selectedTemplate, isLoadingTemplate } = useTemplateStore()

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 bg-surface-2 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Шаблон (норма)
        </h2>
        {selectedTemplate && (
          <p className="text-xs text-gray-500 mt-0.5">{selectedTemplate.name}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-3">
        {isLoadingTemplate ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">Завантаження шаблону...</p>
          </div>
        ) : selectedTemplate ? (
          selectedTemplate.sections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-20">&#128203;</div>
              <p className="text-sm">
                Оберіть шаблон для початку роботи
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

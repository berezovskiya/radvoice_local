import { useState, useEffect, useRef, useCallback } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useMappingStore } from '../../store/useMappingStore'
import { generateImpression } from '../../services/llmService'
import ImpressionSuggestion from './ImpressionSuggestion'
import StudyPicker from '../StudyPicker/StudyPicker'
import type { TemplateSection, TemplateSubsection } from '../../types/template'
import type { SectionUpdate } from '../../types/mapping'
import type { DicomStudy } from '../../types/electron'

const ACTION_COLORS: Record<string, string> = {
  replaced: 'border-l-accent-blue bg-accent-blue/5',
  confirmed_normal: 'border-l-accent-green bg-accent-green/5',
  auto_normal: 'border-l-accent-green/60 bg-accent-green/5',
  not_mentioned: 'border-l-gray-600 bg-surface-3/30',
}

const ACTION_LABELS: Record<string, string> = {
  replaced: 'Змінено',
  confirmed_normal: 'Норма підтверджена',
  auto_normal: 'Авто-норма',
  not_mentioned: 'Не згадано',
}

/* ── Animated wrapper — staggered fly-in from right ── */

function FlyIn({
  children,
  delay,
  active,
}: {
  children: React.ReactNode
  delay: number
  active: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [active, delay])

  if (!active) return <>{children}</>

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-12'
      }`}
    >
      {children}
    </div>
  )
}

/* ── Subsection with traceability + animation ── */

function AutoTextarea({ value, onChange, className, placeholder }: {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}) {
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
      rows={1}
      placeholder={placeholder}
      className={`w-full resize-none bg-transparent border-0 outline-none p-0 text-sm text-gray-300 leading-relaxed placeholder:text-gray-600 placeholder:italic focus:ring-1 focus:ring-accent-blue/30 focus:rounded-sm ${className ?? ''}`}
    />
  )
}

function NormaButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title="Заповнити нормою"
      className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-green/10 text-accent-green/70 hover:bg-accent-green/20 hover:text-accent-green transition-colors"
    >
      Н
    </button>
  )
}

function ReportSubsection({
  sub,
  update,
  animDelay,
  animActive,
}: {
  sub: TemplateSubsection
  update: SectionUpdate | undefined
  animDelay: number
  animActive: boolean
}) {
  const { hoveredSectionId, setHoveredSectionId, updateSectionText, applyAutoNormaSection } = useMappingStore()
  const action = update?.action ?? 'not_mentioned'
  const isChanged = update?.action === 'replaced' || update?.action === 'auto_normal'
  const text = isChanged ? update!.newText : sub.defaultText
  const colorClass = isChanged
    ? ACTION_COLORS[action]
    : update
      ? (ACTION_COLORS[action] ?? ACTION_COLORS.not_mentioned)
      : ''
  const isHovered = hoveredSectionId === sub.id
  const hasSource = update && update.sourceFragments && update.sourceFragments.length > 0

  // Show per-subsection norma button when no update or not_mentioned
  const canNorma = (!update || update.action === 'not_mentioned') && !!(sub.normalText || sub.defaultText)

  // Show border-l only when we have mapping results
  const borderClass = update ? `border-l-2 ${colorClass}` : 'bg-surface-3/50 border border-border-subtle'

  return (
    <FlyIn delay={animDelay} active={animActive && update?.action === 'replaced'}>
      <div
        className={`p-2 rounded transition-all duration-150 ${borderClass} ${
          isHovered ? 'ring-2 ring-accent-blue/50 bg-accent-blue/10' : ''
        } ${hasSource ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => hasSource && setHoveredSectionId(sub.id)}
        onMouseLeave={() => setHoveredSectionId(null)}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-xs font-medium text-gray-400">{sub.title}</h4>
          {update && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-surface-3 ${
              update.action === 'replaced' && animActive ? 'text-accent-blue font-medium'
                : update.action === 'auto_normal' ? 'text-accent-green/80'
                : 'text-gray-500'
            }`}>
              {ACTION_LABELS[action]}
            </span>
          )}
          {canNorma && (
            <NormaButton onClick={() => applyAutoNormaSection(sub.id, sub.normalText || sub.defaultText)} />
          )}
        </div>
        {update ? (
          <AutoTextarea
            value={text}
            onChange={(val) => updateSectionText(sub.id, val)}
            placeholder={sub.placeholder}
          />
        ) : text ? (
          <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">{sub.placeholder ?? '—'}</p>
        )}
        {isHovered && hasSource && (
          <div className="mt-1.5 pt-1.5 border-t border-border-subtle">
            <p className="text-[10px] text-accent-blue/70">
              Джерело: &laquo;{update!.sourceFragments[0].text.slice(0, 80)}
              {update!.sourceFragments[0].text.length > 80 ? '...' : ''}&raquo;
            </p>
          </div>
        )}
      </div>
    </FlyIn>
  )
}

/* ── Section with traceability + animation ── */

function ReportSection({
  section,
  animBaseDelay,
  animActive,
}: {
  section: TemplateSection
  animBaseDelay: number
  animActive: boolean
}) {
  const { getSectionUpdate, hoveredSectionId, setHoveredSectionId, updateSectionText, applyAutoNormaSection } = useMappingStore()
  const isGroup = section.type === 'group' && section.subsections

  if (isGroup) {
    let subDelay = animBaseDelay
    return (
      <div className="p-3 bg-surface-2 rounded-lg border border-border-subtle">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          {section.title}
        </h3>
        <div className="ml-1 space-y-2">
          {section.subsections!.map((sub) => {
            const update = getSectionUpdate(sub.id)
            const delay = subDelay
            if (update?.action === 'replaced') subDelay += 120
            return (
              <ReportSubsection
                key={sub.id}
                sub={sub}
                update={update}
                animDelay={delay}
                animActive={animActive}
              />
            )
          })}
        </div>
      </div>
    )
  }

  const update = getSectionUpdate(section.id)
  const action = update?.action ?? 'not_mentioned'
  const isChanged = update?.action === 'replaced' || update?.action === 'auto_normal'
  const text = isChanged ? update!.newText : section.defaultText ?? ''
  const colorClass = isChanged
    ? ACTION_COLORS[action]
    : update
      ? (ACTION_COLORS[action] ?? ACTION_COLORS.not_mentioned)
      : ''
  const isHovered = hoveredSectionId === section.id
  const hasSource = update && update.sourceFragments && update.sourceFragments.length > 0

  // Per-section norma button for free_text
  const canNorma = (!update || update.action === 'not_mentioned') && !!(section.normalText || section.defaultText)

  const borderClass = update ? `border-l-2 ${colorClass}` : ''

  return (
    <FlyIn delay={animBaseDelay} active={animActive && update?.action === 'replaced'}>
      <div
        className={`p-3 bg-surface-2 rounded-lg border border-border-subtle transition-all duration-150 ${borderClass} ${
          isHovered ? 'ring-2 ring-accent-blue/50 bg-accent-blue/10' : ''
        } ${hasSource ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => hasSource && setHoveredSectionId(section.id)}
        onMouseLeave={() => setHoveredSectionId(null)}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">
            {section.title}
          </h3>
          {update && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-surface-3 ${
              update.action === 'replaced' && animActive ? 'text-accent-blue font-medium'
                : update.action === 'auto_normal' ? 'text-accent-green/80'
                : 'text-gray-500'
            }`}>
              {ACTION_LABELS[action]}
            </span>
          )}
          {canNorma && (
            <NormaButton onClick={() => applyAutoNormaSection(section.id, section.normalText || section.defaultText || '')} />
          )}
          {section.id === 'impression' && <GenerateImpressionButton />}
        </div>
        {update ? (
          text ? (
            <AutoTextarea
              value={text}
              onChange={(val) => updateSectionText(section.id, val)}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">
              {section.placeholder ?? '—'}
            </p>
          )
        ) : text ? (
          <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {section.placeholder ?? '—'}
          </p>
        )}
        {isHovered && hasSource && (
          <div className="mt-1.5 pt-1.5 border-t border-border-subtle">
            <p className="text-[10px] text-accent-blue/70">
              Джерело: &laquo;{update!.sourceFragments[0].text.slice(0, 80)}
              {update!.sourceFragments[0].text.length > 80 ? '...' : ''}&raquo;
            </p>
          </div>
        )}
        {section.id === 'impression' && <ImpressionSuggestion />}
      </div>
    </FlyIn>
  )
}

/* ── Main panel ── */

function GenerateImpressionButton() {
  const { selectedTemplate } = useTemplateStore()
  const {
    mappingResult,
    isGeneratingImpression,
    impressionSuggestion,
    setGeneratingImpression,
    setImpressionSuggestion,
    setImpressionError,
  } = useMappingStore()

  if (!selectedTemplate || !mappingResult || isGeneratingImpression || impressionSuggestion) return null

  const handleGenerate = async () => {
    setGeneratingImpression(true)
    try {
      const text = await generateImpression(selectedTemplate, mappingResult)
      setImpressionSuggestion(text)
    } catch (err) {
      setImpressionError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <button
      onClick={handleGenerate}
      className="text-[10px] px-2 py-1 rounded-md bg-accent-orange/10 text-accent-orange/80 hover:bg-accent-orange/20 hover:text-accent-orange transition-colors"
    >
      AI висновок
    </button>
  )
}

export default function ReportPanel() {
  const { selectedTemplate, isLoadingTemplate } = useTemplateStore()
  const { mappingResult, isProcessing, processingError } = useMappingStore()
  const hasMapping = mappingResult !== null
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null)

  const handleStudySelect = useCallback((study: DicomStudy) => {
    setSelectedStudy(study)

    // Auto-fill patient_info fields in mapping store
    const fields: Array<[string, string]> = [
      ['patient_name', study.patientName],
      ['patient_dob', study.dateOfBirth],
      ['patient_id', study.patientId],
      ['exam_date', study.studyDate],
    ]

    const state = useMappingStore.getState()
    const result = state.mappingResult ?? { sectionUpdates: [], unmappedFragments: [] }
    let sectionUpdates = [...result.sectionUpdates]

    for (const [id, text] of fields) {
      if (!text) continue
      const update = { sectionId: id, action: 'replaced' as const, newText: text, sourceFragments: [] }
      const idx = sectionUpdates.findIndex((u) => u.sectionId === id)
      if (idx >= 0) sectionUpdates[idx] = update
      else sectionUpdates = [...sectionUpdates, update]
    }

    useMappingStore.setState({ mappingResult: { ...result, sectionUpdates } })
  }, [])

  // Track when mapping just arrived to trigger animations
  const [animActive, setAnimActive] = useState(false)
  const prevMappingRef = useRef(mappingResult)

  useEffect(() => {
    if (mappingResult && mappingResult !== prevMappingRef.current) {
      setAnimActive(true)
      // Deactivate animation flag after all fly-ins complete
      const timer = setTimeout(() => setAnimActive(false), 3000)
      prevMappingRef.current = mappingResult
      return () => clearTimeout(timer)
    }
  }, [mappingResult])

  // Header changes based on state
  const headerLabel = hasMapping
    ? 'Фінальний звіт'
    : isProcessing
      ? 'Обробка...'
      : 'Звіт (шаблон)'
  const headerBg = hasMapping
    ? 'bg-accent-blue/10 border-accent-blue/20'
    : 'bg-surface-2 border-border-subtle'
  const headerText = hasMapping ? 'text-accent-blue' : 'text-gray-400'

  return (
    <div className="h-full flex flex-col">
      {/* Study picker — collapsible patient selector */}
      <StudyPicker onSelect={handleStudySelect} />

      <div className={`px-3 py-2 border-b ${headerBg}`}>
        <div className="flex items-center gap-2">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${headerText}`}>
            {headerLabel}
          </h2>
          {isProcessing && (
            <div className="text-sm animate-spin text-gray-500">&#9881;</div>
          )}
        </div>
        {selectedStudy && (
          <p className="text-xs text-accent-orange mt-0.5">
            {selectedStudy.patientName} · {selectedStudy.patientId} · {selectedStudy.studyDate}
          </p>
        )}
        {selectedTemplate && (
          <p className="text-xs text-gray-500 mt-0.5">{selectedTemplate.name}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-3">
        {processingError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-3xl mb-3">&#9888;</div>
              <p className="text-sm text-accent-red mb-2">Помилка обробки</p>
              <p className="text-xs text-gray-500">{processingError}</p>
            </div>
          </div>
        ) : hasMapping && selectedTemplate ? (
          // After mapping — show results with fly-in animation + traceability
          selectedTemplate.sections.map((section, sIdx) => (
            <ReportSection
              key={section.id}
              section={section}
              animBaseDelay={sIdx * 100}
              animActive={animActive}
            />
          ))
        ) : selectedTemplate ? (
          // Before mapping OR during processing — show template with overlay
          <div className={`${isProcessing ? 'opacity-60' : ''} transition-opacity duration-300`}>
            {selectedTemplate.sections.map((section) => {
              const isGroup = section.type === 'group' && section.subsections
              return (
                <div key={section.id} className="p-3 bg-surface-2 rounded-lg border border-border-subtle mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    {section.title}
                  </h3>
                  {isGroup ? (
                    <div className="ml-1 mt-2 space-y-2">
                      {section.subsections!.map((sub) => (
                        <div key={sub.id} className="p-2 bg-surface-3/50 rounded border border-border-subtle">
                          <h4 className="text-xs font-medium text-gray-400">{sub.title}</h4>
                          {sub.defaultText ? (
                            <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{sub.defaultText}</p>
                          ) : (
                            <p className="text-sm text-gray-500 italic mt-0.5">{sub.placeholder ?? '—'}</p>
                          )}
                        </div>
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
            })}
          </div>
        ) : isLoadingTemplate ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">Завантаження шаблону...</p>
          </div>
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

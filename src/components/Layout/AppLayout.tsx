import { useState, useCallback, useRef } from 'react'
import Toolbar from '../Toolbar/Toolbar'
import ReportPanel from '../ReportPanel/ReportPanel'
import DictationPanel from '../DictationPanel/DictationPanel'
import ChecklistPanel from '../ChecklistPanel/ChecklistPanel'
import SettingsModal from '../Settings/SettingsModal'
import CalculatorModal from '../Calculator/CalculatorModal'
import { useDictationStore } from '../../store/useDictationStore'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useMappingStore } from '../../store/useMappingStore'
import * as audioService from '../../services/audioService'
import { mapTranscriptToTemplate } from '../../services/llmService'
import type { Template } from '../../types/template'
import type { MappingResult } from '../../types/mapping'

function buildReportOutput(template: Template, mapping: MappingResult) {
  const textLines: string[] = []
  const htmlLines: string[] = []

  for (const section of template.sections) {
    const isGroup = section.type === 'group' && section.subsections

    if (isGroup) {
      if (section.id !== 'patient_info') {
        textLines.push(`${section.title.toUpperCase()}`)
        htmlLines.push(`<p><b>${section.title}</b><br>`)
      } else {
        htmlLines.push('<p>')
      }

      for (const sub of section.subsections!) {
        const update = mapping.sectionUpdates.find((u) => u.sectionId === sub.id)
        const text = (update?.action === 'replaced' || update?.action === 'auto_normal') ? update.newText : sub.defaultText
        textLines.push(`  ${sub.title}: ${text}`)
        htmlLines.push(`<b>${sub.title}:</b> ${text}<br>`)
      }
      textLines.push('')
      htmlLines.push('</p>')
    } else {
      const update = mapping.sectionUpdates.find((u) => u.sectionId === section.id)
      const text = (update?.action === 'replaced' || update?.action === 'auto_normal') ? update.newText : (section.defaultText ?? '')
      textLines.push(`${section.title.toUpperCase()}`)
      textLines.push(text)
      textLines.push('')
      htmlLines.push(`<p><b>${section.title}</b><br>${text}</p>`)
    }
  }

  return {
    text: textLines.join('\n'),
    html: htmlLines.join('\n'),
  }
}

const MIN_RIGHT_W = 240
const MAX_RIGHT_W = 700
const DEFAULT_RIGHT_W = 340

const MIN_CHECKLIST_FRAC = 0.15
const MAX_CHECKLIST_FRAC = 0.75
const DEFAULT_CHECKLIST_FRAC = 0.45

export default function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_W)
  const [checklistFrac, setChecklistFrac] = useState(DEFAULT_CHECKLIST_FRAC)
  const dragging = useRef(false)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    const startX = e.clientX
    const startW = rightWidth

    const onMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX
      const newW = Math.min(MAX_RIGHT_W, Math.max(MIN_RIGHT_W, startW + delta))
      setRightWidth(newW)
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [rightWidth])

  const onHDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    const panel = rightPanelRef.current
    if (!panel) return

    const onMouseMove = (ev: MouseEvent) => {
      const rect = panel.getBoundingClientRect()
      const totalH = rect.height
      const mouseY = ev.clientY - rect.top
      const newFrac = 1 - mouseY / totalH
      setChecklistFrac(Math.min(MAX_CHECKLIST_FRAC, Math.max(MIN_CHECKLIST_FRAC, newFrac)))
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const {
    isRecording,
    setRecording,
    setTranscribing,
    addEntry,
    entries,
    getFullTranscript,
  } = useDictationStore()

  const { selectedTemplate } = useTemplateStore()

  const {
    mappingResult,
    isProcessing,
    setProcessing,
    setMappingResult,
    setProcessingError,
  } = useMappingStore()

  const handleRecord = async () => {
    if (isRecording) {
      try {
        setTranscribing(true)
        const { wavBuffer, durationSeconds } = await audioService.stopRecording()
        setRecording(false)

        const wavPath = await window.electronAPI.saveTempWav(wavBuffer)
        const text = await window.electronAPI.transcribe(wavPath)
        addEntry(text.trim() || '(пусто)', durationSeconds)
      } catch (err) {
        console.error('Transcription failed:', err)
        setRecording(false)
        addEntry(`[Помилка транскрипції: ${err instanceof Error ? err.message : String(err)}]`, 0)
      } finally {
        setTranscribing(false)
      }
    } else {
      try {
        await audioService.startRecording()
        setRecording(true)
      } catch (err) {
        console.error('Recording failed:', err)
      }
    }
  }

  const handleProcess = async () => {
    if (!selectedTemplate) return
    const transcript = getFullTranscript()
    if (!transcript.trim()) return

    try {
      setProcessing(true)
      const result = await mapTranscriptToTemplate(selectedTemplate, transcript)
      setMappingResult(result)
    } catch (err) {
      console.error('Mapping failed:', err)
      setProcessingError(err instanceof Error ? err.message : String(err))
    }
  }

  const [toastVisible, setToastVisible] = useState(false)

  const handleFinalize = async () => {
    if (!selectedTemplate || !mappingResult) return

    const { text, html } = buildReportOutput(selectedTemplate, mappingResult)
    await window.electronAPI.writeRichClipboard({ text, html })

    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const handleAutoNorma = () => {
    if (!selectedTemplate) return
    useMappingStore.getState().applyAutoNormaAll(selectedTemplate)
  }

  const handleCalculatorInsert = (text: string) => {
    if (!selectedTemplate) return
    const targetId =
      selectedTemplate.sections.find((s) => s.id === 'impression')?.id ??
      selectedTemplate.sections.find((s) => s.type === 'free_text')?.id
    if (!targetId) return

    const state = useMappingStore.getState()
    const result = state.mappingResult ?? { sectionUpdates: [], unmappedFragments: [] }
    const existing = result.sectionUpdates.find((u) => u.sectionId === targetId)
    const currentText = existing?.newText ?? ''
    const newText = currentText ? `${currentText}\n${text}` : text

    const newUpdate = {
      sectionId: targetId,
      action: 'replaced' as const,
      newText,
      sourceFragments: [],
    }

    const sectionUpdates = existing
      ? result.sectionUpdates.map((u) => (u.sectionId === targetId ? newUpdate : u))
      : [...result.sectionUpdates, newUpdate]

    useMappingStore.setState({
      mappingResult: { ...result, sectionUpdates },
    })
  }

  const handleNewReport = () => {
    if (mappingResult && !window.confirm('Почати новий звіт? Поточний буде втрачено.')) return
    useDictationStore.getState().clearAll()
    useMappingStore.getState().clearMapping()
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Toolbar */}
      <Toolbar
        onRecord={handleRecord}
        onProcess={handleProcess}
        onAutoNorma={handleAutoNorma}
        onFinalize={handleFinalize}
        onNewReport={handleNewReport}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCalculator={() => setCalculatorOpen(true)}
        isRecording={isRecording}
        isProcessing={isProcessing}
        canProcess={entries.length > 0 && selectedTemplate !== null && !isProcessing}
        canAutoNorma={selectedTemplate !== null && !isProcessing}
        canFinalize={mappingResult !== null}
      />

      {/* 2-panel layout with resizable divider */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main panel — Report */}
        <div className="flex-1 min-w-0 bg-surface-1">
          <ReportPanel />
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          className="w-1 hover:w-1.5 bg-border-subtle hover:bg-accent-blue/40 cursor-col-resize transition-colors shrink-0"
        />

        {/* Right panel — Dictation + Checklist */}
        <div ref={rightPanelRef} style={{ width: rightWidth }} className="shrink-0 bg-surface-1 flex flex-col">
          {selectedTemplate?.checklist && selectedTemplate.checklist.length > 0 ? (
            <>
              <div className="min-h-0 overflow-hidden" style={{ flex: `${1 - checklistFrac} 1 0%` }}>
                <DictationPanel />
              </div>
              <div
                onMouseDown={onHDividerMouseDown}
                className="h-1 hover:h-1.5 bg-border-subtle hover:bg-accent-blue/40 cursor-row-resize transition-colors shrink-0"
              />
              <div className="min-h-0 overflow-hidden" style={{ flex: `${checklistFrac} 1 0%` }}>
                <ChecklistPanel />
              </div>
            </>
          ) : (
            <DictationPanel />
          )}
        </div>
      </div>

      {/* Settings modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Calculator modal */}
      <CalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onInsert={handleCalculatorInsert}
      />

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-accent-green text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
          Звіт скопійовано в буфер обміну
        </div>
      )}
    </div>
  )
}

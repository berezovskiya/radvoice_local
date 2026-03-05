import TemplateSelector from './TemplateSelector'

interface ToolbarProps {
  onRecord: () => void
  onProcess: () => void
  onAutoNorma: () => void
  onFinalize: () => void
  onNewReport: () => void
  onOpenSettings: () => void
  onOpenCalculator: () => void
  isRecording: boolean
  isProcessing: boolean
  canProcess: boolean
  canAutoNorma: boolean
  canFinalize: boolean
}

/* ── Small icon-button with tooltip ── */
function ToolbarBtn({
  onClick,
  disabled,
  title,
  className,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  title: string
  className: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all no-drag ${className}`}
    >
      {children}
    </button>
  )
}

export default function Toolbar({
  onRecord,
  onProcess,
  onAutoNorma,
  onFinalize,
  onNewReport,
  onOpenSettings,
  onOpenCalculator,
  isRecording,
  isProcessing,
  canProcess,
  canAutoNorma,
  canFinalize,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 pl-20 pr-3 py-1.5 bg-surface-2 border-b border-border-subtle app-drag-region min-w-0">
      {/* App title */}
      <h1 className="text-sm font-semibold text-gray-200 tracking-wide uppercase mr-2 shrink-0 no-drag select-none">RadVoice</h1>

      {/* Template selector */}
      <div className="shrink min-w-0">
        <TemplateSelector />
      </div>

      <div className="w-px h-5 bg-border-default/50 mx-1 shrink-0" />

      {/* ── Action buttons group ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Record */}
        <ToolbarBtn
          onClick={onRecord}
          disabled={isProcessing}
          title={isRecording ? 'Зупинити запис' : 'Почати запис'}
          className={
            isRecording
              ? 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30 ring-1 ring-accent-red/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed'
          }
        >
          {isRecording ? (
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-red animate-pulse" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
          )}
        </ToolbarBtn>

        {/* Process */}
        <ToolbarBtn
          onClick={onProcess}
          disabled={!canProcess}
          title={isProcessing ? 'Обробка...' : 'Обробити диктовку'}
          className={
            canProcess
              ? 'text-accent-blue hover:bg-accent-blue/15 hover:ring-1 hover:ring-accent-blue/20'
              : 'text-gray-600 cursor-not-allowed'
          }
        >
          {isProcessing ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          )}
        </ToolbarBtn>

        {/* Auto-Norma */}
        <ToolbarBtn
          onClick={onAutoNorma}
          disabled={!canAutoNorma}
          title="Все норма — заповнити нормальними знахідками"
          className={
            canAutoNorma
              ? 'text-accent-green hover:bg-accent-green/15 hover:ring-1 hover:ring-accent-green/20'
              : 'text-gray-600 cursor-not-allowed'
          }
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </ToolbarBtn>

        {/* Calculator */}
        <ToolbarBtn
          onClick={onOpenCalculator}
          title="Класифікаційні калькулятори"
          className="text-accent-orange hover:bg-accent-orange/15 hover:ring-1 hover:ring-accent-orange/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="10" y2="10" />
            <line x1="14" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="10" y2="14" />
            <line x1="14" y1="14" x2="16" y2="14" />
            <line x1="8" y1="18" x2="10" y2="18" />
            <line x1="14" y1="18" x2="16" y2="18" />
          </svg>
        </ToolbarBtn>

        <div className="w-px h-4 bg-border-default/30 mx-0.5" />

        {/* Finalize */}
        <ToolbarBtn
          onClick={onFinalize}
          disabled={!canFinalize}
          title="Фіналізувати звіт"
          className={
            canFinalize
              ? 'text-accent-green hover:bg-accent-green/15 hover:ring-1 hover:ring-accent-green/20'
              : 'text-gray-600 cursor-not-allowed'
          }
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </ToolbarBtn>

        {/* New report */}
        <ToolbarBtn
          onClick={onNewReport}
          title="Новий звіт"
          className="text-gray-400 hover:text-gray-200 hover:bg-surface-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </ToolbarBtn>
      </div>

      <div className="flex-1 min-w-2" />

      {/* Settings */}
      <ToolbarBtn
        onClick={onOpenSettings}
        title="Налаштування"
        className="text-gray-500 hover:text-gray-300 hover:bg-surface-3 shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </ToolbarBtn>
    </div>
  )
}

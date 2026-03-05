import type { Template } from '../../types/template'

interface MetadataFormProps {
  metadata: Pick<Template, 'name' | 'modality' | 'bodyPart' | 'language' | 'version'>
  onChange: <K extends keyof Template>(field: K, value: Template[K]) => void
}

const MODALITIES = ['MRI', 'CT', 'X-ray', 'US', 'PET-CT', 'Mammography']
const BODY_PARTS = ['brain', 'chest', 'abdomen', 'pelvis', 'spine', 'musculoskeletal', 'head_neck', 'breast', 'cardiac', 'vascular']

export default function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  return (
    <div className="bg-surface-2 border border-border-default rounded-lg p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Метадані шаблону
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Name — full width */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Назва шаблону *</label>
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="напр. МРТ головного мозку — стандартний протокол"
            className="w-full px-3 py-1.5 bg-surface-3 border border-border-default rounded text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Modality */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Модальність</label>
          <input
            type="text"
            list="modality-list"
            value={metadata.modality}
            onChange={(e) => onChange('modality', e.target.value)}
            placeholder="напр. MRI"
            className="w-full px-3 py-1.5 bg-surface-3 border border-border-default rounded text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
          <datalist id="modality-list">
            {MODALITIES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        {/* Body Part */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ділянка тіла</label>
          <input
            type="text"
            list="bodypart-list"
            value={metadata.bodyPart}
            onChange={(e) => onChange('bodyPart', e.target.value)}
            placeholder="напр. brain"
            className="w-full px-3 py-1.5 bg-surface-3 border border-border-default rounded text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
          <datalist id="bodypart-list">
            {BODY_PARTS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Мова</label>
          <select
            value={metadata.language}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full px-3 py-1.5 bg-surface-3 border border-border-default rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          >
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Version */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Версія</label>
          <input
            type="text"
            value={metadata.version}
            onChange={(e) => onChange('version', e.target.value)}
            placeholder="1.0.0"
            className="w-full px-3 py-1.5 bg-surface-3 border border-border-default rounded text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>
      </div>
    </div>
  )
}

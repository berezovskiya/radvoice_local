import { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [horosDbPath, setHorosDbPath] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getApiKey().then(setApiKey)
      window.electronAPI.getHorosDbPath().then(setHorosDbPath)
      setSaved(false)
    }
  }, [isOpen])

  const handleBrowseHoros = async () => {
    const result = await window.electronAPI.browseHorosDb()
    if (result) setHorosDbPath(result)
  }

  const handleSave = async () => {
    await window.electronAPI.setApiKey(apiKey.trim())
    await window.electronAPI.setHorosDbPath(horosDbPath.trim())
    setSaved(true)
    setTimeout(() => onClose(), 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-2 border border-border-default rounded-xl w-[460px] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
          <h2 className="text-sm font-semibold text-gray-200">Налаштування</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
          >
            &#10005;
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2 bg-surface-3 border border-border-default rounded-lg text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Отримайте ключ на{' '}
              <span className="text-accent-blue">openrouter.ai/keys</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Horos Database
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={horosDbPath}
                onChange={(e) => setHorosDbPath(e.target.value)}
                placeholder="~/Documents/Horos Data/Database.sql (авто)"
                className="flex-1 px-3 py-2 bg-surface-3 border border-border-default rounded-lg text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              />
              <button
                onClick={handleBrowseHoros}
                className="px-3 py-2 bg-surface-3 border border-border-default rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-accent-blue/30 transition-colors shrink-0"
              >
                ...
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Залиште порожнім для шляху за замовчуванням (~/Documents/Horos Data/Database.sql)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-accent-blue text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
          >
            {saved ? 'Збережено!' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}

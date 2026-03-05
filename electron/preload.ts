import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Templates
  getTemplateList: () => ipcRenderer.invoke('template:list'),
  loadTemplate: (fileName: string) => ipcRenderer.invoke('template:load', fileName),
  saveTemplate: (fileName: string, template: object) =>
    ipcRenderer.invoke('template:save', { fileName, template }),
  deleteTemplate: (fileName: string) => ipcRenderer.invoke('template:delete', fileName),
  importTemplateFile: () => ipcRenderer.invoke('template:import'),
  exportTemplateFile: (template: object) => ipcRenderer.invoke('template:export', template),

  // Clipboard (dual: plain text + HTML for bold headings in Word)
  writeRichClipboard: (data: { text: string; html: string }) =>
    ipcRenderer.invoke('clipboard:writeRich', data),

  // Audio
  saveTempWav: (arrayBuffer: ArrayBuffer) =>
    ipcRenderer.invoke('audio:saveTempWav', arrayBuffer),

  // Whisper transcription
  transcribe: (wavPath: string) => ipcRenderer.invoke('whisper:transcribe', wavPath),
  checkWhisperModel: () => ipcRenderer.invoke('whisper:checkModel'),

  // Settings
  getApiKey: () => ipcRenderer.invoke('settings:getApiKey'),
  setApiKey: (key: string) => ipcRenderer.invoke('settings:setApiKey', key),
  getHorosDbPath: () => ipcRenderer.invoke('settings:getHorosDbPath'),
  setHorosDbPath: (dbPath: string) => ipcRenderer.invoke('settings:setHorosDbPath', dbPath),
  browseHorosDb: () => ipcRenderer.invoke('settings:browseHorosDb'),

  // DICOM studies
  scanStudies: () => ipcRenderer.invoke('dicom:scanStudies'),
})

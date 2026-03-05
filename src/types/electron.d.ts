export interface ElectronAPI {
  // Templates
  getTemplateList: () => Promise<import('./template').TemplateListItem[]>
  loadTemplate: (fileName: string) => Promise<import('./template').Template>
  saveTemplate: (fileName: string, template: object) => Promise<boolean>
  deleteTemplate: (fileName: string) => Promise<boolean>
  importTemplateFile: () => Promise<import('./template').Template | null>
  exportTemplateFile: (template: object) => Promise<boolean>

  // Clipboard
  writeRichClipboard: (data: { text: string; html: string }) => Promise<boolean>

  // Audio
  saveTempWav: (arrayBuffer: ArrayBuffer) => Promise<string>

  // Whisper
  transcribe: (wavPath: string) => Promise<string>
  checkWhisperModel: () => Promise<boolean>

  // Settings
  getApiKey: () => Promise<string>
  setApiKey: (key: string) => Promise<boolean>
  getHorosDbPath: () => Promise<string>
  setHorosDbPath: (dbPath: string) => Promise<boolean>
  browseHorosDb: () => Promise<string | null>

  // DICOM studies
  scanStudies: () => Promise<DicomStudy[]>
}

export interface DicomStudy {
  id: number
  patientName: string
  patientId: string
  dateOfBirth: string
  studyDate: string
  modality: string
  studyDescription: string
  accessionNumber: string
  numberOfImages: number
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

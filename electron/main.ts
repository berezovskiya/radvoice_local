import { app, BrowserWindow, ipcMain, clipboard, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import os from 'node:os'
import getStore from './store'
import { scanStudies } from './dicomStudies'

const execFileAsync = promisify(execFile)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function getModelsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'models')
    : path.join(__dirname, '../models')
}

function getTemplatesDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'templates')
    : path.join(__dirname, '../templates')
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'RadVoice',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

// IPC: Get list of templates
ipcMain.handle('template:list', async () => {
  const templatesDir = getTemplatesDir()
  try {
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'))
    return files.map(f => {
      const content = JSON.parse(fs.readFileSync(path.join(templatesDir, f), 'utf-8'))
      return { id: content.id, name: content.name, modality: content.modality, file: f }
    })
  } catch {
    return []
  }
})

// IPC: Load a specific template
ipcMain.handle('template:load', async (_event, fileName: string) => {
  const filePath = path.join(getTemplatesDir(), fileName)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
})

// IPC: Save template to disk
ipcMain.handle('template:save', async (_event, data: { fileName: string; template: object }) => {
  const filePath = path.join(getTemplatesDir(), data.fileName)
  fs.writeFileSync(filePath, JSON.stringify(data.template, null, 2), 'utf-8')
  return true
})

// IPC: Delete template from disk
ipcMain.handle('template:delete', async (_event, fileName: string) => {
  const filePath = path.join(getTemplatesDir(), fileName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
  return true
})

// IPC: Import template from external file via open dialog
ipcMain.handle('template:import', async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    filters: [{ name: 'JSON Template', extensions: ['json'] }],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const content = fs.readFileSync(result.filePaths[0], 'utf-8')
  return JSON.parse(content)
})

// IPC: Export template to external file via save dialog
ipcMain.handle('template:export', async (_event, template: object) => {
  if (!win) return false
  const result = await dialog.showSaveDialog(win, {
    defaultPath: 'template.json',
    filters: [{ name: 'JSON Template', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePath) return false
  fs.writeFileSync(result.filePath, JSON.stringify(template, null, 2), 'utf-8')
  return true
})

// IPC: Write rich content to clipboard (plain text + HTML)
ipcMain.handle('clipboard:writeRich', async (_event, data: { text: string; html: string }) => {
  clipboard.write({ text: data.text, html: data.html })
  return true
})

// IPC: Save audio buffer to temp WAV file
ipcMain.handle('audio:saveTempWav', async (_event, arrayBuffer: ArrayBuffer) => {
  const tmpDir = os.tmpdir()
  const wavPath = path.join(tmpDir, `radvoice-${Date.now()}.wav`)
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(wavPath, buffer)
  return wavPath
})

// IPC: Transcribe audio using whisper-cli
ipcMain.handle('whisper:transcribe', async (_event, wavPath: string) => {
  const modelPath = path.join(getModelsDir(), 'ggml-large-v3.bin')

  if (!fs.existsSync(modelPath)) {
    throw new Error(`Whisper model not found: ${modelPath}`)
  }

  if (!fs.existsSync(wavPath)) {
    throw new Error(`Audio file not found: ${wavPath}`)
  }

  try {
    const { stdout } = await execFileAsync('whisper-cli', [
      '-m', modelPath,
      '-f', wavPath,
      '-l', 'uk',
      '--no-timestamps',
      '-nt',
    ], {
      timeout: 300000, // 5 min max
      maxBuffer: 10 * 1024 * 1024,
    })

    // Clean up temp file
    try { fs.unlinkSync(wavPath) } catch { /* ignore */ }

    return stdout.trim()
  } catch (err: unknown) {
    // Clean up temp file on error too
    try { fs.unlinkSync(wavPath) } catch { /* ignore */ }
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Whisper transcription failed: ${message}`)
  }
})

// IPC: Check if whisper model exists
ipcMain.handle('whisper:checkModel', async () => {
  const modelPath = path.join(getModelsDir(), 'ggml-large-v3.bin')
  return fs.existsSync(modelPath)
})

// IPC: Settings — get API key
ipcMain.handle('settings:getApiKey', async () => {
  return getStore().get('openrouterApiKey', '')
})

// IPC: Settings — set API key
ipcMain.handle('settings:setApiKey', async (_event, key: string) => {
  getStore().set('openrouterApiKey', key)
  return true
})

// IPC: Settings — get Horos DB path
ipcMain.handle('settings:getHorosDbPath', async () => {
  return getStore().get('horosDbPath', '')
})

// IPC: Settings — set Horos DB path
ipcMain.handle('settings:setHorosDbPath', async (_event, dbPath: string) => {
  getStore().set('horosDbPath', dbPath)
  return true
})

// IPC: Browse for Horos DB file
ipcMain.handle('settings:browseHorosDb', async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    title: 'Оберіть Database.sql файл Horos',
    defaultPath: path.join(os.homedir(), 'Documents', 'Horos Data'),
    filters: [{ name: 'SQLite Database', extensions: ['sql', 'sqlite', 'db'] }],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

// IPC: Scan DICOM studies from Horos database
ipcMain.handle('dicom:scanStudies', async () => {
  const customPath = getStore().get('horosDbPath', '')
  return scanStudies(customPath || undefined)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

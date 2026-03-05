import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

// ---------------------------------------------------------------------------
// Horos / OsiriX SQLite database reader
// ---------------------------------------------------------------------------
// Horos stores study metadata in a CoreData-backed SQLite database.
// Table ZSTUDY contains: ZNAME, ZPATIENTID, ZDATEOFBIRTH, ZDATE, ZMODALITY,
// ZSTUDYNAME, ZACCESSIONNUMBER, ZINSTITUTIONNAME, ZNUMBEROFIMAGES, etc.
// Dates are in Apple CoreData "absolute time" = seconds since 2001-01-01.
// ---------------------------------------------------------------------------

/** Exported study record used by the renderer process */
export interface DicomStudy {
  id: number          // ZSTUDY.Z_PK
  patientName: string
  patientId: string
  dateOfBirth: string // DD/MM/YYYY or ''
  studyDate: string   // DD/MM/YYYY or ''
  modality: string
  studyDescription: string
  accessionNumber: string
  numberOfImages: number
}

/** Apple Core Data epoch: 2001-01-01T00:00:00Z in Unix timestamp */
const CORE_DATA_EPOCH = 978307200

/** Convert Apple CoreData timestamp to DD/MM/YYYY string */
function coreDataToDateStr(timestamp: number | null): string {
  if (timestamp === null || timestamp === undefined) return ''
  const unixMs = (timestamp + CORE_DATA_EPOCH) * 1000
  const d = new Date(unixMs)
  if (isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/** Default Horos data path on macOS */
function getDefaultHorosDbPath(): string {
  return path.join(os.homedir(), 'Documents', 'Horos Data', 'Database.sql')
}

/**
 * Scan Horos SQLite database and return recent studies.
 * @param customDbPath — optional override; otherwise uses default Horos path
 * @param limit — how many recent studies to return (default 100)
 */
export function scanStudies(customDbPath?: string, limit = 100): DicomStudy[] {
  const dbPath = customDbPath || getDefaultHorosDbPath()

  if (!fs.existsSync(dbPath)) {
    return []
  }

  let db: Database.Database | null = null
  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true })

    const rows = db
      .prepare(
        `SELECT Z_PK, ZNAME, ZPATIENTID, ZDATEOFBIRTH, ZDATE,
                ZMODALITY, ZSTUDYNAME, ZACCESSIONNUMBER, ZNUMBEROFIMAGES
         FROM ZSTUDY
         ORDER BY ZDATE DESC
         LIMIT ?`,
      )
      .all(limit) as Array<{
      Z_PK: number
      ZNAME: string | null
      ZPATIENTID: string | null
      ZDATEOFBIRTH: number | null
      ZDATE: number | null
      ZMODALITY: string | null
      ZSTUDYNAME: string | null
      ZACCESSIONNUMBER: string | null
      ZNUMBEROFIMAGES: number | null
    }>

    return rows.map((r) => ({
      id: r.Z_PK,
      patientName: (r.ZNAME ?? '').trim(),
      patientId: (r.ZPATIENTID ?? '').trim(),
      dateOfBirth: coreDataToDateStr(r.ZDATEOFBIRTH),
      studyDate: coreDataToDateStr(r.ZDATE),
      modality: (r.ZMODALITY ?? '').trim(),
      studyDescription: (r.ZSTUDYNAME ?? '').trim(),
      accessionNumber: (r.ZACCESSIONNUMBER ?? '').trim(),
      numberOfImages: r.ZNUMBEROFIMAGES ?? 0,
    }))
  } catch (err) {
    console.error('[dicomStudies] Failed to read Horos DB:', err)
    throw err
  } finally {
    db?.close()
  }
}

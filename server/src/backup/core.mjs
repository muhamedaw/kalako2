// Plain JS (no TS syntax) so it can be imported both by scripts/backup-db.mjs
// (run directly with `node`, no tsx) and by src/backup/scheduler.mts (tsx).
import fs from 'node:fs'
import path from 'node:path'

export const RETENTION_COUNT = 14
const NAME_RE = /^kalak-\d{4}-\d{2}-\d{2}-\d{6}\.db$/

function timestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return `${date}-${time}`
}

/** Deletes all but the newest `retentionCount` backup files in backupsDir. Returns deleted filenames. */
export function pruneOldBackups(backupsDir, retentionCount = RETENTION_COUNT) {
  if (!fs.existsSync(backupsDir)) return []
  const files = fs.readdirSync(backupsDir).filter((f) => NAME_RE.test(f)).sort()
  const excess = files.length - retentionCount
  if (excess <= 0) return []
  const toDelete = files.slice(0, excess)
  for (const f of toDelete) fs.unlinkSync(path.join(backupsDir, f))
  return toDelete
}

/** Copies dbPath into backupsDir with a timestamped name, then prunes. Never writes outside backupsDir. */
export function runBackup(dbPath, backupsDir, retentionCount = RETENTION_COUNT) {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`DB file not found at ${dbPath}`)
  }
  fs.mkdirSync(backupsDir, { recursive: true })
  const file = `kalak-${timestamp()}.db`
  fs.copyFileSync(dbPath, path.join(backupsDir, file))
  const deleted = pruneOldBackups(backupsDir, retentionCount)
  return { file, deleted }
}

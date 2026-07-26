// Manually trigger a DB backup. Usage: node scripts/backup-db.mjs
// (Run from the server/ directory, matching the other scripts in this folder.)
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runBackup } from '../src/backup/core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '..')

const rawDbPath = process.env.DB_PATH || path.join('data', 'kalak.sqlite')
const dbPath = path.isAbsolute(rawDbPath) ? rawDbPath : path.resolve(SERVER_ROOT, rawDbPath)
const backupsDir = path.join(SERVER_ROOT, 'backups')

try {
  const { file, deleted } = runBackup(dbPath, backupsDir)
  console.log(`Backup created: backups/${file}`)
  if (deleted.length) console.log(`Pruned ${deleted.length} old backup(s): ${deleted.join(', ')}`)
} catch (err) {
  console.error('Backup failed:', err.message)
  process.exit(1)
}

import fs from 'node:fs'
import path from 'node:path'
import { config, serverRoot } from '../config.mts'
import { runBackup } from './core.mjs'

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000
const BACKUP_NAME_RE = /^kalak-\d{4}-\d{2}-\d{2}-\d{6}\.db$/

function newestBackupAgeMs(backupsDir: string): number | null {
  if (!fs.existsSync(backupsDir)) return null
  const files = fs.readdirSync(backupsDir).filter((f) => BACKUP_NAME_RE.test(f)).sort()
  if (files.length === 0) return null
  const newest = files[files.length - 1]
  return Date.now() - fs.statSync(path.join(backupsDir, newest)).mtimeMs
}

/**
 * Starts the in-process 24h backup loop (no second PM2 process — this runs inside
 * kalak-backend). PM2 restarts happen often during deploys; unconditionally backing
 * up on every boot would burn through the 14-slot retention within a single day of
 * restarts. So: only back up immediately if the newest existing backup is missing or
 * already >=24h old, otherwise wait for the next scheduled tick.
 */
export function startBackupScheduler() {
  // Tests call createApp() repeatedly against throwaway temp DB files — never let
  // those reach the real backups/ directory.
  if (process.env.DISABLE_BACKUP_SCHEDULER === 'true') return null

  const backupsDir = path.join(serverRoot, 'backups')

  const run = () => {
    try {
      const { file, deleted } = runBackup(config.dbPath, backupsDir)
      console.log(`[kalak] backup created: ${file}${deleted.length ? `, pruned ${deleted.length} old` : ''}`)
    } catch (err) {
      console.error('[kalak] scheduled backup failed:', err)
    }
  }

  const age = newestBackupAgeMs(backupsDir)
  if (age === null || age >= BACKUP_INTERVAL_MS) run()

  const timer = setInterval(run, BACKUP_INTERVAL_MS)
  timer.unref()
  return timer
}

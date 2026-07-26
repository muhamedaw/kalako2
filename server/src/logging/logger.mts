import fs from 'node:fs'
import path from 'node:path'
import { serverRoot } from '../config.mts'

const LOG_DIR = process.env.LOG_DIR || path.join(serverRoot, 'logs')
const RETENTION_DAYS = 14
const MAX_STACK_CHARS = 2000
const LOG_NAME_RE = /^error-\d{4}-\d{2}-\d{2}\.log$/

// Fields a caller is allowed to attach to a log entry. Deliberately narrow — callers
// must never pass a raw client payload or config object through here (that's how a
// secret or a full payment body would end up on disk).
export interface ErrorLogContext {
  event?: string
  deviceId?: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function todayLogPath(): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return path.join(LOG_DIR, `error-${stamp}.log`)
}

function pruneOldLogs() {
  if (!fs.existsSync(LOG_DIR)) return
  const files = fs.readdirSync(LOG_DIR).filter((f) => LOG_NAME_RE.test(f)).sort()
  const excess = files.length - RETENTION_DAYS
  for (const f of files.slice(0, Math.max(excess, 0))) {
    fs.unlinkSync(path.join(LOG_DIR, f))
  }
}

/** Logs an error as one JSON line. Never throws — a broken logger must never break the caller. */
export function logError(err: unknown, context: ErrorLogContext = {}): void {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error && err.stack ? err.stack.slice(0, MAX_STACK_CHARS) : undefined
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      stack,
      event: context.event,
      deviceId: context.deviceId,
    }
    fs.appendFileSync(todayLogPath(), JSON.stringify(entry) + '\n')
    pruneOldLogs()
  } catch (loggingErr) {
    console.error('[kalak] failed to write error log:', loggingErr)
  }
}

/** Returns the last `limit` log lines across recent log files (newest last), for get_recent_errors. */
export function getRecentErrorLines(limit = 50): string[] {
  try {
    if (!fs.existsSync(LOG_DIR)) return []
    const files = fs.readdirSync(LOG_DIR).filter((f) => LOG_NAME_RE.test(f)).sort()
    const lines: string[] = []
    for (const f of files.slice(-2)) {
      // today's file, plus yesterday's in case today's is still short
      const content = fs.readFileSync(path.join(LOG_DIR, f), 'utf-8')
      lines.push(...content.split('\n').filter(Boolean))
    }
    return lines.slice(-limit)
  } catch (err) {
    console.error('[kalak] failed to read error logs:', err)
    return []
  }
}

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { runBackup, pruneOldBackups, RETENTION_COUNT } from '../src/backup/core.mjs'

function tmpDir(prefix: string): string {
  const dir = path.join(os.tmpdir(), `${prefix}-${crypto.randomUUID()}`)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

test('runBackup copies the live DB file into backupsDir with a timestamped name', async (t) => {
  const workDir = tmpDir('kalak-backup-src')
  const backupsDir = tmpDir('kalak-backup-dest')
  t.after(() => {
    fs.rmSync(workDir, { recursive: true, force: true })
    fs.rmSync(backupsDir, { recursive: true, force: true })
  })

  const dbPath = path.join(workDir, 'kalak.sqlite')
  fs.writeFileSync(dbPath, 'FAKE_SQLITE_CONTENT')

  const { file, deleted } = runBackup(dbPath, backupsDir)

  assert.match(file, /^kalak-\d{4}-\d{2}-\d{2}-\d{6}\.db$/)
  assert.deepEqual(deleted, [])
  const backupPath = path.join(backupsDir, file)
  assert.ok(fs.existsSync(backupPath))
  assert.equal(fs.readFileSync(backupPath, 'utf-8'), 'FAKE_SQLITE_CONTENT')
})

test('runBackup throws a clear error (does not crash) if the DB file does not exist', async (t) => {
  const backupsDir = tmpDir('kalak-backup-dest')
  t.after(() => fs.rmSync(backupsDir, { recursive: true, force: true }))

  assert.throws(() => runBackup('/nonexistent/kalak.sqlite', backupsDir), /DB file not found/)
})

test('retention: creating more than 14 backups auto-prunes to exactly 14, keeping the newest', async (t) => {
  const backupsDir = tmpDir('kalak-backup-retention')
  t.after(() => fs.rmSync(backupsDir, { recursive: true, force: true }))
  fs.mkdirSync(backupsDir, { recursive: true })

  // Create 20 dummy backup files with strictly increasing timestamps in their names
  // (the naming format itself sorts chronologically, so we don't need real file mtimes).
  const names: string[] = []
  for (let i = 0; i < 20; i++) {
    const d = new Date(2026, 0, 1, 0, 0, i) // seconds 0..19, same day
    const pad = (n: number) => String(n).padStart(2, '0')
    const name = `kalak-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.db`
    fs.writeFileSync(path.join(backupsDir, name), `backup-${i}`)
    names.push(name)
  }
  assert.equal(fs.readdirSync(backupsDir).length, 20)

  const deleted = pruneOldBackups(backupsDir, RETENTION_COUNT)

  const remaining = fs.readdirSync(backupsDir).sort()
  assert.equal(remaining.length, 14, 'exactly 14 backups must remain')
  assert.equal(deleted.length, 6, '6 oldest backups must have been deleted')
  // The 14 newest (last 14 by chronological name order) must be the ones kept.
  assert.deepEqual(remaining, names.slice(6).sort())
  // The 6 oldest must be exactly what was deleted.
  assert.deepEqual(deleted.sort(), names.slice(0, 6).sort())
})

test('retention: 14 or fewer backups are left untouched', async (t) => {
  const backupsDir = tmpDir('kalak-backup-retention-small')
  t.after(() => fs.rmSync(backupsDir, { recursive: true, force: true }))
  fs.mkdirSync(backupsDir, { recursive: true })

  for (let i = 0; i < 5; i++) {
    fs.writeFileSync(path.join(backupsDir, `kalak-2026-01-01-00000${i}.db`), `x`)
  }

  const deleted = pruneOldBackups(backupsDir, RETENTION_COUNT)
  assert.deepEqual(deleted, [])
  assert.equal(fs.readdirSync(backupsDir).length, 5)
})

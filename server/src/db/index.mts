import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs, { type Database } from 'sql.js'
import { config } from '../config.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let db: Database | null = null

export async function initDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs()
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true })
  const existing = fs.existsSync(config.dbPath) ? fs.readFileSync(config.dbPath) : undefined
  db = new SQL.Database(existing)

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  db.run(schema)
  runMigrations(db)
  persistToDisk()
  return db
}

// One-off, non-idempotent schema changes that can't be expressed as
// `CREATE ... IF NOT EXISTS` in schema.sql (which re-runs on every boot).
// SQLite has no `ALTER TABLE ADD COLUMN IF NOT EXISTS`, so each migration
// guards itself by swallowing the "duplicate column name" error.
function runMigrations(database: Database) {
  try {
    database.run('ALTER TABLE players ADD COLUMN email TEXT')
  } catch (err) {
    if (!(err instanceof Error) || !/duplicate column name/i.test(err.message)) throw err
  }
}

export function getDb(): Database {
  if (!db) throw new Error('DB not initialized — call initDb() before using it')
  return db
}

export function persistToDisk() {
  if (!db) return
  fs.writeFileSync(config.dbPath, Buffer.from(db.export()))
}

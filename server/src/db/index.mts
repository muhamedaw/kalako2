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
  persistToDisk()
  return db
}

export function getDb(): Database {
  if (!db) throw new Error('DB not initialized — call initDb() before using it')
  return db
}

export function persistToDisk() {
  if (!db) return
  fs.writeFileSync(config.dbPath, Buffer.from(db.export()))
}

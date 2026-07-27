import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs, { type Database } from 'sql.js'
import { config } from '../config.mts'
import { randomPlayerTag } from '../game/playerTag.mts'

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
  try {
    database.run('ALTER TABLE players ADD COLUMN player_tag TEXT')
  } catch (err) {
    if (!(err instanceof Error) || !/duplicate column name/i.test(err.message)) throw err
  }
  // Must run after the ALTER TABLE above (see schema.sql's comment on why this index can't
  // live there) but before the backfill below, so uniqueness is enforced from the start.
  database.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_player_tag ON players(player_tag)')
  backfillPlayerTags(database)
}

// One-time backfill for rows created before player_tag existed. New rows get a tag at
// INSERT time instead (see economy.mts's ensureProfileRow), so this only ever touches
// legacy rows and is a no-op once every existing player has been backfilled.
function backfillPlayerTags(database: Database) {
  const rows = database.exec(`SELECT device_id FROM players WHERE player_tag IS NULL`)
  if (rows.length === 0) return

  const existingTags = new Set<string>()
  const existingRows = database.exec(`SELECT player_tag FROM players WHERE player_tag IS NOT NULL`)
  if (existingRows.length > 0) {
    for (const [tag] of existingRows[0].values) existingTags.add(tag as string)
  }

  for (const [deviceId] of rows[0].values) {
    let tag = randomPlayerTag()
    while (existingTags.has(tag)) tag = randomPlayerTag()
    existingTags.add(tag)
    database.run(`UPDATE players SET player_tag = ? WHERE device_id = ?`, [tag, deviceId])
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

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '..')

export const config = {
  port: Number(process.env.PORT) || 4001,
  joinBaseUrl: process.env.JOIN_BASE_URL || `http://localhost:${Number(process.env.PORT) || 4001}`,
  dbPath: process.env.DB_PATH || path.join(SERVER_ROOT, 'data', 'kalak.sqlite'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  minPlayers: 2,
  maxPlayers: 20,
  reconnectWindowMs: Number(process.env.RECONNECT_WINDOW_MS) || 30_000,
  voteTimeSeconds: Number(process.env.VOTE_TIME_SECONDS) || 30,
  tiebreakerTimeSeconds: Number(process.env.TIEBREAKER_TIME_SECONDS) || 15,
  maxTiebreakerRounds: 3,
}

export const serverRoot = SERVER_ROOT

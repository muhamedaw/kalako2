import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '..')

// Explicit allowlist, never '*' — this API now handles real payments and per-device
// coin balances. CORS_ORIGIN in .env may be a comma-separated list to override.
const DEFAULT_CORS_ORIGINS = [
  'https://kalako-client.vercel.app',
  'http://localhost:5173', // Vite dev server
]

export const config = {
  port: Number(process.env.PORT) || 4001,
  joinBaseUrl: process.env.JOIN_BASE_URL || `http://localhost:${Number(process.env.PORT) || 4001}`,
  dbPath: process.env.DB_PATH || path.join(SERVER_ROOT, 'data', 'kalak.sqlite'),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_CORS_ORIGINS,
  minPlayers: 2,
  maxPlayers: 20,
  reconnectWindowMs: Number(process.env.RECONNECT_WINDOW_MS) || 30_000,
  voteTimeSeconds: Number(process.env.VOTE_TIME_SECONDS) || 30,
  tiebreakerTimeSeconds: Number(process.env.TIEBREAKER_TIME_SECONDS) || 15,
  maxTiebreakerRounds: 3,
  paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  paypalMode: process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox',
  paypalPremiumPlanId: process.env.PAYPAL_PREMIUM_PLAN_ID || 'P-XXXXXXXXXXXXXXXX',
  paypalReturnUrl: process.env.PAYPAL_RETURN_URL || 'https://kalako.app/premium/success',
  paypalCancelUrl: process.env.PAYPAL_CANCEL_URL || 'https://kalako.app/premium/cancel',
  debugToken: process.env.DEBUG_TOKEN || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  recoveryEmailFrom: process.env.RECOVERY_EMAIL_FROM || 'Kalako <onboarding@resend.dev>',
}

export const serverRoot = SERVER_ROOT

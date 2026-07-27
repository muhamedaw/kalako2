import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import { ensureProfileRow } from './economy.mts'
import { isRateLimited } from './rateLimit.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function generateCode(): string {
  // CSPRNG, not Math.random — this code is a bearer credential for email/account takeover.
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

function isEmailConfigured(): boolean {
  return Boolean(config.gmailUser && config.gmailAppPassword)
}

// Built once, not per-send — nodemailer pools/reuses the SMTP connection internally.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.gmailUser, pass: config.gmailAppPassword },
    })
  }
  return transporter
}

async function sendRecoveryEmail(to: string, code: string, purpose: 'link_email' | 'recover_account'): Promise<boolean> {
  if (!isEmailConfigured()) return false
  const subject = purpose === 'link_email' ? 'Confirm your Kalako email' : 'Recover your Kalako account'
  const text = `Your Kalako verification code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.`
  // Plain-text-only body with a from-name (not a bare address) — reduces the chance Gmail
  // or the recipient's spam filter flags this as a generic transactional/automated blast.
  const html = `<p>Your Kalako verification code is <strong style="font-size:18px">${code}</strong>.</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`
  try {
    await getTransporter().sendMail({
      from: `"${config.recoveryEmailFromName}" <${config.gmailUser}>`,
      to,
      subject,
      text,
      html,
    })
    return true
  } catch (err) {
    console.error('[kalak] Gmail SMTP send failed:', err)
    return false
  }
}

function parseAvatarConfig(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch {}
  return { body: 'body_1', eyes: 'eyes_1', hat: 'hat_none' }
}

export function registerRecoveryHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'add_recovery_email', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; email?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const emailRaw = asString(payload?.email)
    if (!deviceId || !emailRaw || !EMAIL_RE.test(emailRaw)) {
      return ack?.({ success: false, error: 'deviceId and a valid email are required' })
    }
    const email = normalizeEmail(emailRaw)

    // A few per hour per device AND per email — either axis alone lets an attacker spam
    // the other (many devices -> one email, or one device -> many emails).
    if (isRateLimited(`add_recovery_email:device:${deviceId}`, 5, 3_600_000)) return ack?.({ success: false, error: 'rate_limited' })
    if (isRateLimited(`add_recovery_email:email:${email}`, 5, 3_600_000)) return ack?.({ success: false, error: 'rate_limited' })

    if (!isEmailConfigured()) return ack?.({ success: false, error: 'email_not_configured' })

    try {
      ensureProfileRow(deviceId, 'Player')
      const db = getDb()
      const code = generateCode()
      // expires_at is computed in SQL (not via JS Date.toISOString()) so it's always in the
      // exact same "YYYY-MM-DD HH:MM:SS" format datetime('now') produces — comparing an ISO
      // "...T...Z" string against that format lexically is unreliable ('T' > ' ' in ASCII),
      // which silently made codes never expire when tried during development.
      db.run(
        `INSERT INTO recovery_codes (email, code, device_id, purpose, expires_at) VALUES (?, ?, ?, 'link_email', datetime('now', '+10 minutes'))`,
        [email, code, deviceId]
      )
      persistToDisk()

      const sent = await sendRecoveryEmail(email, code, 'link_email')
      if (!sent) return ack?.({ success: false, error: 'email_send_failed' })
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] add_recovery_email failed:', err)
      ack?.({ success: false, error: 'add_recovery_email_failed' })
    }
  })

  safeOn(socket, 'confirm_recovery_email', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; email?: string; code?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const emailRaw = asString(payload?.email)
    const code = asString(payload?.code)
    if (!deviceId || !emailRaw || !code) return ack?.({ success: false, reason: 'invalid_or_expired' })
    const email = normalizeEmail(emailRaw)

    // Defense against brute-forcing the 6-digit code within its 10-minute window.
    if (isRateLimited(`confirm_recovery_email:${deviceId}`, 20, 600_000)) return ack?.({ success: false, reason: 'invalid_or_expired' })

    try {
      const db = getDb()
      const rows = db.exec(
        `SELECT rowid FROM recovery_codes WHERE email = ? AND code = ? AND device_id = ? AND purpose = 'link_email' AND expires_at > datetime('now')`,
        [email, code, deviceId]
      )
      if (rows.length === 0 || rows[0].values.length === 0) return ack?.({ success: false, reason: 'invalid_or_expired' })

      db.run(`UPDATE players SET email = ? WHERE device_id = ?`, [email, deviceId])
      db.run(`DELETE FROM recovery_codes WHERE email = ? AND code = ? AND device_id = ? AND purpose = 'link_email'`, [email, code, deviceId])
      persistToDisk()
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] confirm_recovery_email failed:', err)
      ack?.({ success: false, reason: 'invalid_or_expired' })
    }
  })

  safeOn(socket, 'request_account_recovery', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { email?: string } | undefined
    const emailRaw = asString(payload?.email)
    // Always ack success even on malformed input — an error shape here would itself leak
    // "this isn't a real account" information the same way a not-found response would.
    if (!emailRaw || !EMAIL_RE.test(emailRaw)) return ack?.({ success: true })
    const email = normalizeEmail(emailRaw)

    const limited = isRateLimited(`request_account_recovery:${email}`, 3, 3_600_000)

    try {
      if (!limited) {
        const db = getDb()
        const rows = db.exec(`SELECT device_id FROM players WHERE email = ?`, [email])
        if (rows.length > 0 && rows[0].values.length > 0) {
          const deviceId = rows[0].values[0][0] as string
          const code = generateCode()
          db.run(
            `INSERT INTO recovery_codes (email, code, device_id, purpose, expires_at) VALUES (?, ?, ?, 'recover_account', datetime('now', '+10 minutes'))`,
            [email, code, deviceId]
          )
          persistToDisk()
          await sendRecoveryEmail(email, code, 'recover_account')
        }
      }
    } catch (err) {
      console.error('[kalak] request_account_recovery failed:', err)
    }

    // Enumeration guard: identical response whether the email matched a player, was
    // rate-limited, or send failed — the client can never distinguish these cases.
    ack?.({ success: true })
  })

  safeOn(socket, 'confirm_account_recovery', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { email?: string; code?: string; newDeviceId?: string } | undefined
    const emailRaw = asString(payload?.email)
    const code = asString(payload?.code)
    const newDeviceId = asString(payload?.newDeviceId)
    if (!emailRaw || !code || !newDeviceId) return ack?.({ success: false, reason: 'invalid_or_expired' })
    const email = normalizeEmail(emailRaw)

    if (isRateLimited(`confirm_account_recovery:${newDeviceId}`, 20, 600_000)) return ack?.({ success: false, reason: 'invalid_or_expired' })

    try {
      const db = getDb()
      const codeRows = db.exec(
        `SELECT device_id FROM recovery_codes WHERE email = ? AND code = ? AND purpose = 'recover_account' AND expires_at > datetime('now')`,
        [email, code]
      )
      if (codeRows.length === 0 || codeRows[0].values.length === 0) return ack?.({ success: false, reason: 'invalid_or_expired' })
      const oldDeviceId = codeRows[0].values[0][0] as string

      const oldRows = db.exec(`SELECT nickname, avatar_id, coins FROM players WHERE device_id = ?`, [oldDeviceId])
      if (oldRows.length === 0 || oldRows[0].values.length === 0) return ack?.({ success: false, reason: 'invalid_or_expired' })
      const [oldNickname, oldAvatarId, oldCoins] = oldRows[0].values[0] as [string, string, number]

      // Transfer (move), not copy: the old device's coins/inventory leave that device so the
      // same purchased items/balance can never exist on two devices at once. Coins are ADDED
      // to whatever newDeviceId already has (it may already be an active guest profile with
      // its own earned coins) rather than overwritten, so recovery never destroys progress
      // already made on the target device. Nickname/avatar are overwritten with the recovered
      // identity, since restoring that identity is the whole point of this flow.
      ensureProfileRow(newDeviceId, oldNickname)
      db.run(
        `UPDATE players SET nickname = ?, avatar_id = ?, coins = coins + ?, email = ? WHERE device_id = ?`,
        [oldNickname, oldAvatarId, Number(oldCoins), email, newDeviceId]
      )
      db.run(
        `INSERT OR IGNORE INTO inventory (device_id, item_id, purchased_at) SELECT ?, item_id, purchased_at FROM inventory WHERE device_id = ?`,
        [newDeviceId, oldDeviceId]
      )
      db.run(`DELETE FROM inventory WHERE device_id = ?`, [oldDeviceId])
      db.run(`UPDATE players SET coins = 0, email = NULL WHERE device_id = ?`, [oldDeviceId])
      db.run(`DELETE FROM recovery_codes WHERE email = ? AND code = ? AND purpose = 'recover_account'`, [email, code])
      persistToDisk()

      const newRow = db.exec(`SELECT nickname, avatar_id, coins FROM players WHERE device_id = ?`, [newDeviceId])
      const [nickname, avatarId, coins] = newRow[0].values[0] as [string, string, number]
      const invRows = db.exec(`SELECT item_id FROM inventory WHERE device_id = ?`, [newDeviceId])
      const inventory = invRows.length > 0
        ? invRows[0].values.map((r: any) => ({ itemId: r[0] as string, equipped: false }))
        : []

      ack?.({
        success: true,
        profile: {
          deviceId: newDeviceId,
          nickname,
          avatarConfig: parseAvatarConfig(avatarId),
          coins: Number(coins),
          inventory,
        },
      })
    } catch (err) {
      console.error('[kalak] confirm_account_recovery failed:', err)
      ack?.({ success: false, reason: 'invalid_or_expired' })
    }
  })
}

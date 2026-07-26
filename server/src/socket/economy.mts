import type { Server, Socket } from 'socket.io'
import { getDb, persistToDisk } from '../db/index.mts'
import { isRateLimited } from './rateLimit.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

interface CatalogItem {
  id: string
  type: 'sound_pack' | 'frame'
  name: string
  description: string
  price: number
  previewId: string
}

// Note: a numbered avatar-preset catalog (avatar_17..22) was removed here. The client's
// avatar system migrated to the {body, eyes, hat} avatarConfig shape (see ProfileScreen /
// ComposedAvatar) with no path that ever equips a numeric preset id, so those items were
// unpurchasable dead weight — zero references anywhere client-side.
const STORE_CATALOG: { type: string; title: string; description: string; items: CatalogItem[] }[] = [
  {
    type: 'sound_pack',
    title: 'Sound Packs',
    description: 'Alternate sound effects for your games',
    items: [
      { id: 'sfx_pack_arcade', type: 'sound_pack', name: 'Arcade', description: 'Punchy arcade-style sound effects', price: 75, previewId: 'arcade' },
      { id: 'sfx_pack_retro', type: 'sound_pack', name: 'Retro', description: '8-bit chiptune sound effects', price: 75, previewId: 'retro' },
      { id: 'sfx_pack_soft', type: 'sound_pack', name: 'Soft', description: 'Gentle, quiet sound effects', price: 75, previewId: 'soft' },
    ],
  },
  {
    type: 'frame',
    title: 'Result Card Frames',
    description: 'Decorative frames for your result cards',
    items: [
      { id: 'frame_gold', type: 'frame', name: 'Gold', description: 'Golden glow frame', price: 40, previewId: 'gold' },
      { id: 'frame_neon', type: 'frame', name: 'Neon', description: 'Neon glow frame', price: 40, previewId: 'neon' },
      { id: 'frame_fire', type: 'frame', name: 'Fire', description: 'Fiery glow frame', price: 40, previewId: 'fire' },
      { id: 'frame_royal', type: 'frame', name: 'Royal', description: 'Royal purple glow frame', price: 40, previewId: 'royal' },
    ],
  },
]

const CATALOG_BY_ID = new Map(STORE_CATALOG.flatMap((section) => section.items).map((item) => [item.id, item]))

const DEFAULT_AVATAR_CONFIG = JSON.stringify({ body: 'body_1', eyes: 'eyes_1', hat: 'hat_none' })

function parseAvatarConfig(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
  } catch {}
  return JSON.parse(DEFAULT_AVATAR_CONFIG)
}

export function ensureProfileRow(deviceId: string, defaultNickname: string) {
  const db = getDb()
  const existing = db.exec(`SELECT device_id FROM players WHERE device_id = ?`, [deviceId])
  if (existing.length === 0 || existing[0].values.length === 0) {
    db.run(`INSERT INTO players (device_id, nickname, avatar_id, coins) VALUES (?, ?, ?, 0)`, [
      deviceId,
      defaultNickname.trim().slice(0, 24) || 'Player',
      DEFAULT_AVATAR_CONFIG,
    ])
    persistToDisk()
  }
}

/** Called by the game state machine at game-over for every player who supplied a deviceId. */
export function awardCoinsForFinishedGame(deviceId: string, defaultNickname: string, amount: number) {
  if (amount <= 0) return
  ensureProfileRow(deviceId, defaultNickname)
  const db = getDb()
  db.run(`UPDATE players SET coins = coins + ? WHERE device_id = ?`, [amount, deviceId])
  db.run(`INSERT INTO notifications (device_id, type, payload_json) VALUES (?, 'coins_earned', ?)`, [
    deviceId,
    JSON.stringify({ amount }),
  ])
  persistToDisk()
}

export function registerEconomyHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'get_or_create_profile', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; nickname?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ error: 'deviceId required' })
    // Keyed by socket.id, not deviceId — deviceId is exactly what an attacker would
    // vary on every call to spam-create profile rows, so it can't be the rate-limit key here.
    if (isRateLimited(`get_or_create_profile:${socket.id}`, 20, 10_000)) return ack?.({ error: 'rate_limited' })

    try {
      ensureProfileRow(deviceId, asString(payload?.nickname) || 'Player')

      const db = getDb()
      const row = db.exec(`SELECT device_id, nickname, avatar_id, coins FROM players WHERE device_id = ?`, [deviceId])
      const profile = row[0].values[0]
      const invRows = db.exec(`SELECT item_id FROM inventory WHERE device_id = ?`, [deviceId])
      const inventory = invRows.length > 0
        ? invRows[0].values.map((r: any) => ({ itemId: r[0] as string, equipped: false }))
        : []

      ack?.({
        deviceId: profile[0],
        nickname: profile[1],
        avatarConfig: parseAvatarConfig(profile[2] as string),
        coins: Number(profile[3]),
        inventory,
      })
    } catch (err) {
      console.error('[kalak] get_or_create_profile failed:', err)
      ack?.({ error: 'profile_failed' })
    }
  })

  safeOn(socket, 'update_profile', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; nickname?: string; avatarConfig?: unknown } | undefined
    const deviceId = asString(payload?.deviceId)
    const nickname = asString(payload?.nickname)
    const avatarConfig = payload?.avatarConfig
    if (!deviceId) return ack?.({ error: 'deviceId required' })
    if (isRateLimited(`update_profile:${deviceId}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })

    try {
      ensureProfileRow(deviceId, nickname || 'Player')
      const db = getDb()

      if (avatarConfig && typeof avatarConfig === 'object' && !Array.isArray(avatarConfig)) {
        db.run(`UPDATE players SET avatar_id = ? WHERE device_id = ?`, [JSON.stringify(avatarConfig), deviceId])
      }

      if (nickname && nickname.trim()) {
        db.run(`UPDATE players SET nickname = ? WHERE device_id = ?`, [nickname.trim().slice(0, 24), deviceId])
      }

      persistToDisk()

      const row = db.exec(`SELECT device_id, nickname, avatar_id, coins FROM players WHERE device_id = ?`, [deviceId])
      const p = row[0].values[0]
      ack?.({ deviceId: p[0], nickname: p[1], avatarConfig: parseAvatarConfig(p[2] as string), coins: Number(p[3]) })
    } catch (err) {
      console.error('[kalak] update_profile failed:', err)
      ack?.({ error: 'update_failed' })
    }
  })

  safeOn(socket, 'get_store_catalog', (_payload: unknown, ack?: (res: unknown) => void) => {
    ack?.(STORE_CATALOG)
  })

  safeOn(socket, 'purchase_item', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; itemId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const itemId = asString(payload?.itemId)
    if (!deviceId || !itemId) return ack?.({ error: 'deviceId and itemId required' })
    if (isRateLimited(`purchase_item:${deviceId}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })

    const item = CATALOG_BY_ID.get(itemId)
    if (!item) return ack?.({ error: 'invalid_item' })

    ensureProfileRow(deviceId, 'Player')
    const db = getDb()

    try {
      const ownedResult = db.exec(`SELECT 1 FROM inventory WHERE device_id = ? AND item_id = ?`, [deviceId, itemId])
      if (ownedResult.length > 0 && ownedResult[0].values.length > 0) {
        return ack?.({ error: 'already_owned' })
      }

      const coinsRow = db.exec(`SELECT coins FROM players WHERE device_id = ?`, [deviceId])
      const coins = Number(coinsRow[0].values[0][0])
      if (coins < item.price) return ack?.({ error: 'insufficient_funds' })

      db.run(`INSERT INTO inventory (device_id, item_id) VALUES (?, ?)`, [deviceId, itemId])
      db.run(`UPDATE players SET coins = coins - ? WHERE device_id = ?`, [item.price, deviceId])
      persistToDisk()

      const newRow = db.exec(`SELECT coins FROM players WHERE device_id = ?`, [deviceId])
      const newCoins = Number(newRow[0].values[0][0])
      const invRows = db.exec(`SELECT item_id FROM inventory WHERE device_id = ?`, [deviceId])
      const inventory = invRows.length > 0
        ? invRows[0].values.map((r: any) => ({ itemId: r[0] as string, equipped: false }))
        : []

      ack?.({ success: true, coins: newCoins, inventory })
    } catch {
      ack?.({ error: 'purchase_failed' })
    }
  })

  safeOn(socket, 'get_hall_of_fame', (_payload: unknown, ack?: (res: unknown) => void) => {
    try {
      const db = getDb()
      const rows = db.exec(`
        SELECT ra.id, ra.answer_text, r.category, r.question_text, ra.votes_received, gp.name,
               COALESCE(v.vote_count, 0) AS community_votes
        FROM round_answers ra
        JOIN rounds r ON ra.round_id = r.id
        JOIN game_players gp ON ra.player_id = gp.player_id AND gp.game_id = r.game_id
        LEFT JOIN (
          SELECT entry_id, COUNT(*) AS vote_count FROM hall_of_fame_votes GROUP BY entry_id
        ) v ON v.entry_id = CAST(ra.id AS TEXT)
        WHERE ra.votes_received > 0
        ORDER BY ra.votes_received DESC, community_votes DESC
        LIMIT 50
      `)

      const entries = rows.length > 0
        ? rows[0].values.map((r: any, i: number) => ({
            id: String(r[0]),
            answerText: r[1] as string,
            category: r[2] as string,
            questionText: r[3] as string,
            voteCount: Number(r[4]),
            playerName: r[5] as string,
            rank: i + 1,
          }))
        : []

      ack?.(entries)
    } catch (err) {
      console.error('[kalak] get_hall_of_fame failed:', err)
      ack?.([])
    }
  })

  safeOn(socket, 'vote_hall_of_fame', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; entryId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const entryId = asString(payload?.entryId)
    if (!deviceId || !entryId) return ack?.({ error: 'deviceId and entryId required' })
    if (isRateLimited(`vote_hall_of_fame:${deviceId}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })

    const db = getDb()
    try {
      db.run(`INSERT INTO hall_of_fame_votes (device_id, entry_id) VALUES (?, ?)`, [deviceId, entryId])
      persistToDisk()

      const countRow = db.exec(`SELECT COUNT(*) FROM hall_of_fame_votes WHERE entry_id = ?`, [entryId])
      const newCount = Number(countRow[0].values[0][0])

      ack?.({ success: true, newVoteCount: newCount })
    } catch {
      ack?.({ success: false, reason: 'already_voted' })
    }
  })

  safeOn(socket, 'get_notifications', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ error: 'deviceId required' })

    try {
      const db = getDb()
      const rows = db.exec(
        `SELECT id, type, payload_json, created_at, read_at FROM notifications WHERE device_id = ? ORDER BY created_at DESC, id DESC LIMIT 50`,
        [deviceId]
      )

      const notifications = rows.length > 0
        ? rows[0].values.map((r: any) => ({
            id: String(r[0]),
            type: r[1] as string,
            payload: JSON.parse(r[2] as string),
            createdAt: r[3] as string,
            read: r[4] !== null,
          }))
        : []

      ack?.(notifications)
    } catch (err) {
      console.error('[kalak] get_notifications failed:', err)
      ack?.([])
    }
  })

  safeOn(socket, 'mark_notification_read', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { notificationId?: string } | undefined
    const notificationId = asString(payload?.notificationId)
    if (!notificationId) return ack?.({ error: 'notificationId required' })
    if (isRateLimited(`mark_notification_read:${socket.id}`, 20, 10_000)) return ack?.({ success: false })

    try {
      const db = getDb()
      db.run(`UPDATE notifications SET read_at = datetime('now') WHERE id = ?`, [notificationId])
      persistToDisk()
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] mark_notification_read failed:', err)
      ack?.({ success: false })
    }
  })

  safeOn(socket, 'get_unread_count', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ error: 'deviceId required' })

    try {
      const db = getDb()
      const row = db.exec(`SELECT COUNT(*) FROM notifications WHERE device_id = ? AND read_at IS NULL`, [deviceId])
      const count = row.length > 0 ? Number(row[0].values[0][0]) : 0
      ack?.({ count })
    } catch (err) {
      console.error('[kalak] get_unread_count failed:', err)
      ack?.({ count: 0 })
    }
  })

  // PayPal coin-pack purchase handlers (create_paypal_order, capture_paypal_order) live in
  // payments.mts — registered separately in socket/index.mts — since they need the
  // transactions table's idempotency guard and the exact tier IDs/prices from spec.
}

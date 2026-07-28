import type { Server, Socket } from 'socket.io'
import type { Database } from 'sql.js'
import { getDb, persistToDisk } from '../db/index.mts'
import { randomPlayerTag } from '../game/playerTag.mts'
import { isRateLimited } from './rateLimit.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

interface CatalogItem {
  id: string
  type: 'sound_pack' | 'frame' | 'avatar_part' | 'categoryUnlock' | 'categoryExpansion'
  name: string
  description: string
  price: number
  previewId: string
}

// Avatar-part ID whitelist for update_profile validation. Must match the exact IDs used
// client-side in avatarParts/types.ts (FREE_BODIES, FREE_EYES, PREMIUM_EYES, FREE_HATS,
// PREMIUM_HATS). Non-zero-padded — body_5 not body_05, hat_beret not hat_04, etc.
const FREE_BODY_IDS = new Set(['body_1', 'body_2', 'body_3', 'body_4', 'body_5', 'body_6', 'body_7', 'body_8', 'body_9', 'body_10', 'body_11', 'body_12', 'body_13', 'body_14'])
const FREE_EYES_IDS = new Set(['eyes_1', 'eyes_2', 'eyes_3', 'eyes_4', 'eyes_9', 'eyes_10', 'eyes_11', 'eyes_12', 'eyes_13', 'eyes_14', 'eyes_15', 'eyes_16', 'eyes_17', 'eyes_18'])
const PREMIUM_EYES_IDS = new Set(['eyes_5', 'eyes_6', 'eyes_7', 'eyes_8', 'eyes_premium_05', 'eyes_premium_06', 'eyes_premium_07', 'eyes_premium_08'])
const FREE_HAT_IDS = new Set(['hat_none', 'hat_party', 'hat_cap', 'hat_headband', 'hat_beret', 'hat_cowboy', 'hat_hood', 'hat_bandana', 'hat_helmet', 'hat_fez', 'hat_flower', 'hat_antenna', 'hat_crown_flower', 'hat_headwrap'])
const PREMIUM_HAT_IDS = new Set(['hat_crown', 'hat_tophat', 'hat_wizard', 'hat_propeller', 'hat_sombrero', 'hat_viking', 'hat_premium_07', 'hat_premium_08', 'hat_premium_09', 'hat_premium_10'])

function isValidAvatarConfig(cfg: Record<string, unknown>): boolean {
  return (
    typeof cfg.body === 'string' && FREE_BODY_IDS.has(cfg.body) &&
    typeof cfg.eyes === 'string' && (FREE_EYES_IDS.has(cfg.eyes) || PREMIUM_EYES_IDS.has(cfg.eyes)) &&
    typeof cfg.hat === 'string' && (FREE_HAT_IDS.has(cfg.hat) || PREMIUM_HAT_IDS.has(cfg.hat))
  )
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
  {
    // Prices intentionally match the existing premium eyes_5-8 / hat_crown-etc. price points
    // per the exact spec given for this catalog extension — not invented new tiers.
    type: 'avatar_part',
    title: 'Premium Avatar Parts',
    description: 'Exclusive eyes and hats for your avatar',
    items: [
      { id: 'eyes_premium_05', type: 'avatar_part', name: 'Twinkle Burst', description: 'Exclusive sparkle-star eyes', price: 150, previewId: 'eyes_premium_05' },
      { id: 'eyes_premium_06', type: 'avatar_part', name: 'Lovestruck', description: 'Exclusive heart-eyes look', price: 150, previewId: 'eyes_premium_06' },
      { id: 'eyes_premium_07', type: 'avatar_part', name: 'Hypno Gaze', description: 'Exclusive hypnotic swirl eyes', price: 200, previewId: 'eyes_premium_07' },
      { id: 'eyes_premium_08', type: 'avatar_part', name: 'Sly Wink', description: 'Exclusive one-eyed wink', price: 200, previewId: 'eyes_premium_08' },
      { id: 'hat_premium_07', type: 'avatar_part', name: 'Halo Vibes', description: 'Exclusive golden halo', price: 250, previewId: 'hat_premium_07' },
      { id: 'hat_premium_08', type: 'avatar_part', name: 'Beat Drop', description: 'Exclusive headphones', price: 200, previewId: 'hat_premium_08' },
      { id: 'hat_premium_09', type: 'avatar_part', name: 'Bunny Bop', description: 'Exclusive bunny ears', price: 250, previewId: 'hat_premium_09' },
      { id: 'hat_premium_10', type: 'avatar_part', name: 'Star Burst', description: 'Exclusive star cluster crown', price: 150, previewId: 'hat_premium_10' },
    ],
  },
  {
    // Permanent per-category unlocks — independent of an active Premium subscription (either
    // path grants access, see game/categoryAccess.mts). Only ever applies to categories added
    // AFTER this feature; every category that was free before stays free forever.
    type: 'categoryUnlock',
    title: 'Category Unlocks',
    description: 'Permanently unlock a premium trivia category',
    items: [
      { id: 'category_unlock_space', type: 'categoryUnlock', name: 'Space & Astronomy', description: 'Unlock the Space category forever', price: 200, previewId: 'space' },
    ],
  },
  {
    // "Expansion" packs: +questions for an EXISTING free category, one-time purchase,
    // inventory-based exactly like cosmetics — ownership alone is what the game checks
    // (see beginAnswering's includeExpansion check in game/stateMachine.mts).
    type: 'categoryExpansion',
    title: 'Category Expansions',
    description: 'Add more questions to a category you already play',
    items: [
      { id: 'category_expansion_sports', type: 'categoryExpansion', name: 'Sports Expansion Pack', description: 'Extra Sports questions for every game in this room', price: 100, previewId: 'sports' },
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

function generateUniquePlayerTag(db: Database): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const tag = randomPlayerTag()
    const existing = db.exec(`SELECT 1 FROM players WHERE player_tag = ?`, [tag])
    if (existing.length === 0 || existing[0].values.length === 0) return tag
  }
  throw new Error('Failed to generate a unique player tag after 20 attempts')
}

export function ensureProfileRow(deviceId: string, defaultNickname: string) {
  const db = getDb()
  const existing = db.exec(`SELECT device_id FROM players WHERE device_id = ?`, [deviceId])
  if (existing.length === 0 || existing[0].values.length === 0) {
    db.run(`INSERT INTO players (device_id, nickname, avatar_id, coins, player_tag) VALUES (?, ?, ?, 0, ?)`, [
      deviceId,
      defaultNickname.trim().slice(0, 24) || 'Player',
      DEFAULT_AVATAR_CONFIG,
      generateUniquePlayerTag(db),
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
      const row = db.exec(`SELECT device_id, nickname, avatar_id, coins, email, player_tag FROM players WHERE device_id = ?`, [deviceId])
      const profile = row[0].values[0]
      const invRows = db.exec(`SELECT item_id FROM inventory WHERE device_id = ?`, [deviceId])
      const inventory = invRows.length > 0
        ? invRows[0].values.map((r: any) => ({ itemId: r[0] as string, equipped: false }))
        : []

      // ORDER BY expires_at DESC: a device can now have more than one 'active' row (a real
      // PayPal subscription plus a gift-code extension, see socket/gifts.mts's
      // redeem_gift_code) — always surface whichever grants premium for longest.
      const premiumRows = db.exec(
        `SELECT status, expires_at FROM premium_subscriptions WHERE device_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`,
        [deviceId]
      )
      const isPremium = premiumRows.length > 0 && premiumRows[0].values.length > 0
      const premiumExpiresAt = isPremium ? (premiumRows[0].values[0][1] as string | null) ?? null : null

      ack?.({
        deviceId: profile[0],
        nickname: profile[1],
        avatarConfig: parseAvatarConfig(profile[2] as string),
        coins: Number(profile[3]),
        email: (profile[4] as string | null) ?? null,
        playerTag: (profile[5] as string | null) ?? null,
        isPremium,
        premiumExpiresAt,
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

      if (avatarConfig && typeof avatarConfig === 'object' && !Array.isArray(avatarConfig) && isValidAvatarConfig(avatarConfig as Record<string, unknown>)) {
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

  // Buys a cosmetic item FOR another player, identified by their public player_tag — the
  // purchaser pays, the recipient's inventory is credited, never the purchaser's own.
  safeOn(socket, 'gift_item_to_tag', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; itemId?: string; recipientPlayerTag?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const itemId = asString(payload?.itemId)
    const recipientTag = (asString(payload?.recipientPlayerTag) || '').trim().toUpperCase()
    if (!deviceId || !itemId || !recipientTag) {
      return ack?.({ error: 'deviceId, itemId and recipientPlayerTag are required' })
    }
    if (isRateLimited(`gift_item_to_tag:${deviceId}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })

    const item = CATALOG_BY_ID.get(itemId)
    if (!item) return ack?.({ error: 'invalid_item' })

    ensureProfileRow(deviceId, 'Player')
    const db = getDb()

    try {
      const recipientRow = db.exec(`SELECT device_id FROM players WHERE player_tag = ?`, [recipientTag])
      if (recipientRow.length === 0 || recipientRow[0].values.length === 0) {
        return ack?.({ error: 'recipient_tag_not_found' })
      }
      const recipientDeviceId = recipientRow[0].values[0][0] as string
      if (recipientDeviceId === deviceId) return ack?.({ error: 'cannot_gift_to_self' })

      const ownedResult = db.exec(`SELECT 1 FROM inventory WHERE device_id = ? AND item_id = ?`, [recipientDeviceId, itemId])
      if (ownedResult.length > 0 && ownedResult[0].values.length > 0) {
        return ack?.({ error: 'recipient_already_owns_item' })
      }

      const coinsRow = db.exec(`SELECT coins FROM players WHERE device_id = ?`, [deviceId])
      const coins = Number(coinsRow[0].values[0][0])
      if (coins < item.price) return ack?.({ error: 'insufficient_funds' })

      db.run(`INSERT INTO inventory (device_id, item_id) VALUES (?, ?)`, [recipientDeviceId, itemId])
      db.run(`UPDATE players SET coins = coins - ? WHERE device_id = ?`, [item.price, deviceId])
      db.run(`INSERT INTO notifications (device_id, type, payload_json) VALUES (?, 'gift_received', ?)`, [
        recipientDeviceId,
        JSON.stringify({ itemId, itemName: item.name }),
      ])
      persistToDisk()

      const newCoinsRow = db.exec(`SELECT coins FROM players WHERE device_id = ?`, [deviceId])
      ack?.({ success: true, coins: Number(newCoinsRow[0].values[0][0]) })
    } catch (err) {
      console.error('[kalak] gift_item_to_tag failed:', err)
      ack?.({ error: 'gift_failed' })
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

import type { Server, Socket } from 'socket.io'
import { getRoomByPlayerId } from '../game/roomManager.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

// Fixed allowlist — ephemeral, no persistence, no moderation surface needed.
const ALLOWED_EMOJI = new Set(['😂', '🔥', '😱', '👏', '💀', '🎉'])

export function registerReactionHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'send_reaction', (_payload: unknown, ack?: (res: unknown) => void) => {
    const playerId = socket.data.playerId as string | undefined
    if (!playerId) return ack?.({ success: false, error: 'not_in_room' })
    // Keyed by playerId (persistent identity), not socket.id — a reconnect must not reset
    // the cooldown, matching this codebase's deviceId-keying convention for real identities.
    if (isRateLimited(`send_reaction:${playerId}`, 1, 2_000)) return ack?.({ success: false, error: 'rate_limited' })

    const payload = asObject<{ emoji?: string }>(_payload)
    const emoji = asString(payload.emoji)
    if (!emoji || !ALLOWED_EMOJI.has(emoji)) return ack?.({ success: false, error: 'invalid_emoji' })

    const room = getRoomByPlayerId(playerId)
    if (!room) return ack?.({ success: false, error: 'not_in_room' })

    io.to(room.code).emit('reaction_received', { playerId, emoji })
    ack?.({ success: true })
  })
}

import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { getRecentErrorLines } from '../logging/logger.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

/** Debug-only. Refuses without the exact DEBUG_TOKEN from .env — not a full admin panel. */
export function registerDebugHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'get_recent_errors', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { token?: string } | undefined
    const token = asString(payload?.token)
    if (!config.debugToken || !token || token !== config.debugToken) {
      return ack?.({ error: 'unauthorized' })
    }
    ack?.({ lines: getRecentErrorLines(50) })
  })
}

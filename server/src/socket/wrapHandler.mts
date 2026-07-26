import type { Socket } from 'socket.io'
import { logError } from '../logging/logger.mts'

type AnyHandler = (...args: unknown[]) => unknown

function extractDeviceId(args: unknown[]): string | undefined {
  const payload = args[0]
  if (payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).deviceId === 'string') {
    return (payload as Record<string, unknown>).deviceId as string
  }
  return undefined
}

function ackErrorIfPossible(args: unknown[]) {
  const maybeAck = args[args.length - 1]
  if (typeof maybeAck === 'function') {
    try {
      ;(maybeAck as (res: unknown) => void)({ error: 'internal_error' })
    } catch {
      // the ack itself threw (e.g. already called) — nothing more to do
    }
  }
}

/**
 * Wraps a socket event handler so a thrown error or rejected promise is logged with
 * context (event name, deviceId if present) instead of crashing the whole process —
 * one player's bad request must never take down the server for everyone else.
 */
export function safeOn(socket: Socket, event: string, handler: AnyHandler): void {
  socket.on(event, (...args: unknown[]) => {
    try {
      const result = handler(...args)
      if (result instanceof Promise) {
        result.catch((err) => {
          logError(err, { event, deviceId: extractDeviceId(args) })
          ackErrorIfPossible(args)
        })
      }
    } catch (err) {
      logError(err, { event, deviceId: extractDeviceId(args) })
      ackErrorIfPossible(args)
    }
  })
}

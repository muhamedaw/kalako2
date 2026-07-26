// Simple in-memory sliding-window rate limiter, keyed per event per identity
// (deviceId when available, socket.id otherwise). Single-process — fine for
// this deployment; would need a shared store (Redis) behind a load balancer.

const buckets = new Map<string, number[]>()

export function isRateLimited(key: string, maxPerWindow: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = buckets.get(key) ?? []
  const recent = timestamps.filter((t) => now - t < windowMs)
  if (recent.length >= maxPerWindow) {
    buckets.set(key, recent)
    return true
  }
  recent.push(now)
  buckets.set(key, recent)
  return false
}

// Periodic sweep so one-shot keys (a socket that connects once and leaves) don't
// accumulate forever in memory. The retention horizon must be >= the longest window
// any caller uses (recovery.mts rate-limits at 3_600_000ms) — a shorter horizon here
// would silently evict timestamps out from under a long-window limiter and reset it
// every sweep, defeating the limit entirely.
const MAX_WINDOW_MS = 3_600_000

const sweepTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of buckets) {
    const recent = timestamps.filter((t) => now - t < MAX_WINDOW_MS)
    if (recent.length === 0) buckets.delete(key)
    else buckets.set(key, recent)
  }
}, 60_000)
sweepTimer.unref()

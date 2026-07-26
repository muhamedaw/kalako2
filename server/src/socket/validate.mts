// Socket.io hands handlers whatever the client sent, verbatim — a default parameter
// (`= {}`) only covers `undefined`, not an explicit `null` or a non-object primitive.
// Every mutating handler normalizes through these before touching the payload.

export function asObject<T extends object>(value: unknown): Partial<T> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Partial<T>) : {}
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

import { getDb } from '../db/index.mts'

// Every category that existed before this feature stays free forever — this set only ever
// grows for genuinely NEW categories added after this point. Adding a category here is the
// single switch that makes it require unlocking; the existing 12 must never be added.
export const PREMIUM_CATEGORIES = new Set<string>(['space'])

export function categoryUnlockItemId(category: string): string {
  return `category_unlock_${category}`
}

export function categoryExpansionItemId(category: string): string {
  return `category_expansion_${category}`
}

function hasActivePremium(deviceId: string): boolean {
  const db = getDb()
  const rows = db.exec(`SELECT 1 FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`, [deviceId])
  return rows.length > 0 && rows[0].values.length > 0
}

function ownsItem(deviceId: string, itemId: string): boolean {
  const db = getDb()
  const rows = db.exec(`SELECT 1 FROM inventory WHERE device_id = ? AND item_id = ?`, [deviceId, itemId])
  return rows.length > 0 && rows[0].values.length > 0
}

/** A device can use a premium category via an active subscription OR a one-time per-category
 * unlock purchase — independent paths, either is sufficient. Non-premium categories are
 * always accessible (this function is only meaningful for ids in PREMIUM_CATEGORIES). */
export function hasCategoryAccess(deviceId: string | null, category: string): boolean {
  if (!PREMIUM_CATEGORIES.has(category)) return true
  if (!deviceId) return false
  return hasActivePremium(deviceId) || ownsItem(deviceId, categoryUnlockItemId(category))
}

export function hasExpansionAccess(deviceId: string | null, category: string): boolean {
  if (!deviceId) return false
  return ownsItem(deviceId, categoryExpansionItemId(category))
}

/** Filters a requested category list down to ones the requesting device can actually use —
 * silently drops inaccessible premium categories rather than erroring, matching how
 * allowedCategories already silently drops unknown category ids. */
export function filterAccessibleCategories(categories: string[], deviceId: string | null): string[] {
  return categories.filter((c) => hasCategoryAccess(deviceId, c))
}

import { create } from 'zustand'

// Shown at most once total, not once per session — once dismissed (or once an email is
// linked) it never nags again on any future device visit. Documented choice per the task:
// a returning player who already said "not now" shouldn't see this every session either.
const DISMISS_KEY = 'kalako_email_nudge_dismissed'

interface PurchaseEmailGateState {
  isOpen: boolean
  pendingAction: (() => void) | null
  /** Call before starting any purchase flow. Runs `action` immediately if no nudge is needed. */
  requestPurchase: (hasEmail: boolean, action: () => void) => void
  skip: () => void
  close: () => void
  markLinked: () => void
}

export const usePurchaseEmailGateStore = create<PurchaseEmailGateState>((set, get) => ({
  isOpen: false,
  pendingAction: null,

  requestPurchase: (hasEmail, action) => {
    if (hasEmail) return action()
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return action()
    } catch { /* private browsing */ }
    set({ isOpen: true, pendingAction: action })
  },

  skip: () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* private browsing */ }
    const action = get().pendingAction
    set({ isOpen: false, pendingAction: null })
    action?.()
  },

  close: () => set({ isOpen: false, pendingAction: null }),

  markLinked: () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* private browsing */ }
    const action = get().pendingAction
    set({ isOpen: false, pendingAction: null })
    action?.()
  },
}))

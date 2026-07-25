import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, CheckSquare, Gamepad2, Bell, User } from 'lucide-react'
import { useNavigationStore, type NavigationState } from '@/store/navigationStore'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import type { Screen } from '@/types'

type Tab = NavigationState['activeTab']

const TAB_TO_SCREEN: Record<Tab, Screen> = {
  play: 'welcome',
  store: 'store',
  voting: 'global_voting',
  notifications: 'notifications',
  profile: 'profile',
}

const SCREEN_TO_TAB: Partial<Record<Screen, Tab>> = {
  welcome: 'play',
  store: 'store',
  global_voting: 'voting',
  notifications: 'notifications',
  profile: 'profile',
}

// Hardcoded for now — no real unread-notifications feature exists yet.
const hasUnread = false

export default function BottomNav() {
  const { activeTab, setActiveTab } = useNavigationStore()
  const { screen, setScreen } = useGameStore()
  const t = useTranslation()

  // Keep the highlighted tab in sync if the screen changes through some other path
  // (e.g. Lobby's "leave room" button going straight back to 'welcome').
  useEffect(() => {
    const mapped = SCREEN_TO_TAB[screen]
    if (mapped && mapped !== activeTab) setActiveTab(mapped)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const go = (tab: Tab) => {
    setActiveTab(tab)
    setScreen(TAB_TO_SCREEN[tab])
  }

  const items: { tab: Tab; label: string; Icon: typeof ShoppingBag }[] = [
    { tab: 'store', label: t.navStore, Icon: ShoppingBag },
    { tab: 'voting', label: t.navVoting, Icon: CheckSquare },
    { tab: 'play', label: t.navPlay, Icon: Gamepad2 },
    { tab: 'notifications', label: t.navNotifications, Icon: Bell },
    { tab: 'profile', label: t.navProfile, Icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label={t.navPlay}
    >
      <div
        className="w-full px-2 flex items-end justify-around"
        style={{
          background: '#1E60FF',
          borderTop: '4px solid #0A0A0A',
        }}
      >
        {items.map(({ tab, label, Icon }) => {
          const isActive = activeTab === tab
          const isCenter = tab === 'play'

          if (isCenter) {
            return (
              <button
                key={tab}
                onClick={() => go(tab)}
                className="relative flex-1 flex flex-col items-center cursor-pointer"
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="-translate-y-4 w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: '#FFD400',
                    border: '4px solid #0A0A0A',
                    boxShadow: '6px 6px 0 #0A0A0A',
                  }}
                >
                  <Icon size={28} color="#fff" strokeWidth={2.25} />
                </motion.div>
                <span className={`text-[11px] font-medium -mt-3 ${isActive ? 'text-white' : 'text-white/50'}`}>
                  {label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={tab}
              onClick={() => go(tab)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 cursor-pointer"
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative">
                <Icon size={22} className={isActive ? 'text-primary' : 'text-white/50'} strokeWidth={2} />
                {tab === 'notifications' && hasUnread && (
                  <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </span>
              <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : 'text-white/50'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

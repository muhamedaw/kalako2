import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Coins, Check } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import GlassCard from '@/components/ui/GlassCard'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr + 'Z').getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getNotifText(notif: { type: string; payload: { amount: number } }, t: any): string {
  if (notif.type === 'coins_earned') {
    return t.notificationsCoinsEarned.replace('{{amount}}', String(notif.payload.amount))
  }
  return ''
}

export default function NotificationsScreen() {
  const t = useTranslation()
  const { notifications, notificationsLoading, loadNotifications, markNotificationRead } = useGameStore()

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleOpen = useCallback((notif: { id: string; read: boolean }) => {
    if (!notif.read) {
      markNotificationRead(notif.id)
    }
  }, [markNotificationRead])

  return (
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-gradient text-center"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {t.navNotifications}
      </motion.h1>

      {notificationsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bell size={48} className="text-white/20" strokeWidth={1.5} />
          <p className="text-white/40 text-sm text-center" style={{ fontFamily: 'var(--font-body)' }}>
            {t.notificationsEmpty}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <button
                onClick={() => handleOpen(notif)}
                className="w-full text-left cursor-pointer"
              >
                <GlassCard
                  className={`flex items-center gap-3 transition-all ${
                    notif.read ? 'opacity-60' : 'border-primary/30'
                  }`}
                  strong={!notif.read}
                >
                  <div className={`w-10 h-10 rounded-xl border-2 border-[#0A0A0A] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#0A0A0A] ${
                    notif.read ? 'bg-white/5' : 'bg-primary/20'
                  }`}>
                    {notif.type === 'coins_earned' ? (
                      <Coins size={20} className="text-primary" strokeWidth={2.5} />
                    ) : (
                      <Bell size={20} className="text-white/50" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-white"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {getNotifText(notif as any, t)}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                      {relativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <Check size={16} className="text-primary flex-shrink-0" strokeWidth={3} />
                  )}
                </GlassCard>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

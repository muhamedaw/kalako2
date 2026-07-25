import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import type { Screen } from '@/types'

// No visual output — just keeps document.title in sync with the active screen
// and current language, using strings already defined in the i18n locale files.
export default function DocumentTitleManager() {
  const screen = useGameStore((s) => s.screen)
  const t = useTranslation()

  useEffect(() => {
    const pageTitles: Partial<Record<Screen, string>> = {
      create: t.createRoomTitle,
      join: t.joinRoomTitle,
      lobby: t.lobbyTitle,
      category_pick: t.categoryPickTitle,
      answering: t.round,
      voting: t.voteTitle,
      round_results: t.roundResults,
      game_over: t.gameOverTitle,
      about: t.aboutTitle,
      how_to_play: t.howToPlayTitle,
      store: t.navStore,
      global_voting: t.navVoting,
      notifications: t.navNotifications,
      profile: t.navProfile,
      dev_asset_preview: t.devPreviewTitle,
    }

    const pageTitle = pageTitles[screen]
    document.title = pageTitle ? `${pageTitle} — ${t.welcomeTitle}` : t.welcomeTitle
  }, [screen, t])

  return null
}

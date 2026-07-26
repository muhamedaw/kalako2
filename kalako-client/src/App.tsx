import { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import I18nProvider from '@/i18n/I18nProvider'
import ReconnectingOverlay from '@/components/screens/ReconnectingOverlay'
import BottomNav from '@/components/navigation/BottomNav'
import Toast from '@/components/ui/Toast'
import SettingsPanel from '@/components/SettingsPanel'
import SettingsGearButton from '@/components/SettingsGearButton'
import DocumentTitleManager from '@/components/DocumentTitleManager'
import WelcomeScreen from '@/components/screens/WelcomeScreen'
import { useGameStore } from '@/store/gameStore'
import { useNavigationStore } from '@/store/navigationStore'
import { useTranslation } from '@/i18n/context'

// Only WelcomeScreen (the default/first-paint view) is eagerly bundled — everything
// else lazy-loads on navigation so the initial JS payload (and mobile LCP) stays
// small. This was the single biggest lever found in the Lighthouse mobile audit.
const CreateRoom = lazy(() => import('@/components/screens/CreateRoom'))
const JoinRoom = lazy(() => import('@/components/screens/JoinRoom'))
const Lobby = lazy(() => import('@/components/screens/Lobby'))
const CategoryPick = lazy(() => import('@/components/screens/CategoryPick'))
const AnswerScreen = lazy(() => import('@/components/screens/AnswerScreen'))
const VoteScreen = lazy(() => import('@/components/screens/VoteScreen'))
const RoundResults = lazy(() => import('@/components/screens/RoundResults'))
const GameOver = lazy(() => import('@/components/screens/GameOver'))
const DevAssetPreview = lazy(() => import('@/components/screens/DevAssetPreview'))
const HowToPlayPage = lazy(() => import('@/components/screens/HowToPlayPage'))
const AboutCreditsScreen = lazy(() => import('@/components/screens/AboutCreditsScreen'))
const LegalPage = lazy(() => import('@/components/screens/LegalPage'))
const GlobalVotingScreen = lazy(() => import('@/components/screens/GlobalVotingScreen'))
const NotificationsScreen = lazy(() => import('@/components/screens/NotificationsScreen'))
const ProfileScreen = lazy(() => import('@/components/screens/ProfileScreen'))
const StoreScreen = lazy(() => import('@/components/screens/StoreScreen'))
const PremiumScreen = lazy(() => import('@/components/screens/PremiumScreen'))

// Screens where the bottom tab bar is shown. Everything else (active game
// rounds, create/join forms, results, dev tools) hides it so it never
// overlaps game UI.
const BOTTOM_NAV_SCREENS = new Set([
  'welcome', 'store', 'global_voting', 'notifications', 'profile', 'lobby',
])

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
}

const pageTransition = {
  duration: 0.28,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
}

function JsonLdScript() {
  const t = useTranslation()
  const json = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalako',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    description: t.appLongDescription,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    browserRequirements: 'Requires JavaScript',
    author: { '@type': 'Person', name: 'Muhammed Awad' },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

function App() {
  const { screen, connect, setScreen } = useGameStore()
  const toggleSettingsPanel = useNavigationStore((s) => s.toggleSettingsPanel)
  const [createDefaultPrivate, setCreateDefaultPrivate] = useState(false)

  useEffect(() => {
    connect()
    const params = new URLSearchParams(window.location.search)
    const joinCode = params.get('join')
    if (joinCode) {
      useGameStore.setState({ pendingJoinCode: joinCode.toUpperCase() })
      setScreen('join')
      window.history.replaceState({}, '', window.location.pathname)
    }
    const dev = params.get('dev')
    if (dev === 'asset-preview') {
      setScreen('dev_asset_preview')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showBottomNav = BOTTOM_NAV_SCREENS.has(screen)
  const showSettingsGear = screen === 'welcome'

  const handleStartCreate = (isPrivate: boolean) => {
    setCreateDefaultPrivate(isPrivate)
    setScreen('create')
  }

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen key="welcome" onStartCreate={handleStartCreate} />
      case 'create':
        return <CreateRoom key="create" initialIsPrivate={createDefaultPrivate} />
      case 'join':
        return <JoinRoom key="join" />
      case 'lobby':
        return <Lobby key="lobby" />
      case 'category_pick':
        return <CategoryPick key="category_pick" />
      case 'answering':
        return <AnswerScreen key="answering" />
      case 'voting':
        return <VoteScreen key="voting" />
      case 'round_results':
        return <RoundResults key="round_results" />
      case 'game_over':
        return <GameOver key="game_over" />
      case 'about':
        return <AboutCreditsScreen key="about" />
      case 'how_to_play':
        return <HowToPlayPage key="how_to_play" />
      case 'store':
        return <StoreScreen key="store" />
      case 'global_voting':
        return <GlobalVotingScreen key="global_voting" />
      case 'notifications':
        return <NotificationsScreen key="notifications" />
      case 'profile':
        return <ProfileScreen key="profile" />
      case 'premium':
        return <PremiumScreen key="premium" />
      case 'legal_privacy':
        return <LegalPage key="legal_privacy" kind="privacy" />
      case 'legal_terms':
        return <LegalPage key="legal_terms" kind="terms" />
      case 'legal_refund':
        return <LegalPage key="legal_refund" kind="refund" />
      case 'dev_asset_preview':
        return <DevAssetPreview key="dev" />
      default:
        return <WelcomeScreen key="welcome" onStartCreate={handleStartCreate} />
    }
  }

  return (
    <I18nProvider>
      <JsonLdScript />
      <DocumentTitleManager />
        {screen === 'welcome' && <AnimatedBackground />}
        {showSettingsGear && (
          <SettingsGearButton onClick={toggleSettingsPanel} />
        )}
        <motion.div
          className="flex-1 flex flex-col"
          style={{
            paddingBottom: showBottomNav
              ? 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))'
              : undefined,
          }}
        >
          <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
          </Suspense>
        </motion.div>
        {showBottomNav && <BottomNav />}
        <SettingsPanel />
        <ReconnectingOverlay />
        <Toast />
    </I18nProvider>
  )
}

export default App

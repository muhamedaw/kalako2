import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import I18nProvider from '@/i18n/I18nProvider'
import ReconnectingOverlay from '@/components/screens/ReconnectingOverlay'
import BottomNav from '@/components/navigation/BottomNav'
import SettingsPanel from '@/components/SettingsPanel'
import SettingsGearButton from '@/components/SettingsGearButton'
import DocumentTitleManager from '@/components/DocumentTitleManager'
import WelcomeScreen from '@/components/screens/WelcomeScreen'
import CreateRoom from '@/components/screens/CreateRoom'
import JoinRoom from '@/components/screens/JoinRoom'
import Lobby from '@/components/screens/Lobby'
import CategoryPick from '@/components/screens/CategoryPick'
import AnswerScreen from '@/components/screens/AnswerScreen'
import VoteScreen from '@/components/screens/VoteScreen'
import RoundResults from '@/components/screens/RoundResults'
import GameOver from '@/components/screens/GameOver'
import DevAssetPreview from '@/components/screens/DevAssetPreview'
import HowToPlayPage from '@/components/screens/HowToPlayPage'
import AboutCreditsScreen from '@/components/screens/AboutCreditsScreen'
import StoreScreen from '@/components/screens/StoreScreen'
import GlobalVotingScreen from '@/components/screens/GlobalVotingScreen'
import NotificationsScreen from '@/components/screens/NotificationsScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import { useGameStore } from '@/store/gameStore'
import { useNavigationStore } from '@/store/navigationStore'

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
      case 'dev_asset_preview':
        return <DevAssetPreview key="dev" />
      default:
        return <WelcomeScreen key="welcome" onStartCreate={handleStartCreate} />
    }
  }

  return (
    <I18nProvider>
      <DocumentTitleManager />
      {screen === 'welcome' && <AnimatedBackground />}
      {showSettingsGear && (
        <SettingsGearButton onClick={toggleSettingsPanel} />
      )}
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
      {showBottomNav && <BottomNav />}
      <SettingsPanel />
      <ReconnectingOverlay />
    </I18nProvider>
  )
}

export default App

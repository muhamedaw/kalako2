import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import ReconnectingOverlay from '@/components/screens/ReconnectingOverlay'
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
import { useGameStore } from '@/store/gameStore'

function App() {
  const { screen, connect, setScreen } = useGameStore()

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

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen key="welcome" />
      case 'create':
        return <CreateRoom key="create" />
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
      case 'dev_asset_preview':
        return <DevAssetPreview key="dev" />
      default:
        return <WelcomeScreen key="welcome" />
    }
  }

  return (
    <>
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
      <ReconnectingOverlay />
    </>
  )
}

export default App

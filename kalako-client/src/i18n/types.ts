export type Lang = 'ar' | 'en' | 'he'

export interface Translations {
  // General
  lang: Lang
  langLabel: string
  dir: 'rtl' | 'ltr'

  // Navbar
  navHome: string
  navHowToPlay: string
  navAbout: string

  // Welcome
  welcomeTitle: string
  welcomeSubtitle: string
  createRoom: string
  joinRoom: string
  welcomeTagline: string

  // Create Room
  createRoomTitle: string
  back: string
  yourName: string
  yourNamePlaceholder: string
  privateRoom: string
  privateRoomDesc: string
  answerTime: string
  rounds: string
  categories: string
  advancedOptions: string
  scoreMultiplier: string
  scoreMultiplierDesc: string
  blindVote: string
  blindVoteDesc: string
  adultsOnly: string
  adultsOnlyDesc: string
  createRoomBtn: string
  sec: string
  answerTime30: string
  answerTime45: string
  answerTime60: string
  answerTime90: string
  rounds3: string
  rounds5: string
  rounds7: string
  rounds10: string

  // Join Room
  joinRoomTitle: string
  roomCode: string
  roomCodePlaceholder: string
  joinRoomBtn: string

  // Lobby
  lobbyTitle: string
  privateBadge: string
  publicBadge: string
  roomCodeLabel: string
  copyCode: string
  copiedCode: string
  copyLink: string
  copiedLink: string
  scanToJoin: string
  players: string
  timeLabel: string
  roundsLabel: string
  startGame: string
  playerCount: string
  waitingForHost: string
  leaveRoom: string
  playersCount: string
  timeFormat: string
  roundsFormat: string

  // Category Pick
  categoryPickTitle: string
  pickCategoryHost: string
  pickCategoryWaiting: string
  tiebreaker: string

  // Answer Screen
  round: string
  doublePoints: string
  questionLoading: string
  answerPlaceholder: string
  submitAnswer: string
  answerSubmitted: string
  answeredCount: string
  charCount: string

  // Vote Screen
  voteTitle: string
  voteSubtitle: string
  yourAnswer: string
  voteSubmitted: string
  votedCount: string

  // Round Results
  roundResults: string
  correctAnswer: string
  answersAndVotes: string
  votes: string
  points: string
  standings: string

  // Game Over
  gameOverTitle: string
  finalStandings: string
  saveImage: string
  exit: string
  youLabel: string
  medal1: string
  medal2: string
  medal3: string

  // Reconnecting
  reconnecting: string
  reconnectingSub: string

  // Dev Preview
  devPreviewTitle: string
  devPreviewBack: string
  devPreviewLogos: string
  devPreviewAvatars: string
  devPreviewCategoryIcons: string
  devPreviewExtraIcons: string
  devPreviewSoundFx: string
  devPreviewQrCode: string
  devPreviewShareCard: string
  devPreviewSplash: string
  devPreviewLobbyBg: string
  devPreviewHorizontal: string
  devPreviewSquare: string
  devPreviewJoin: string
  devPreviewCountdown: string
  devPreviewSubmit: string
  devPreviewVote: string
  devPreviewCorrect: string
  devPreviewTricked: string
  devPreviewWin: string
  devPreviewScoreMultiplier: string
  devPreviewBlindVote: string
  devPreviewMostDeceptive: string
  devPreviewFamily: string
  devPreviewAdults: string
  devPreviewSubtitle: string
  devPreviewWithNeon: string
  devPreviewSmall: string

  // ARIA / misc brand labels
  logoHorizontalAria: string
  logoSquareAria: string
  splashAria: string
  lobbyBgAria: string
  timerAria: string
  scoreMultiplierAria: string
  blindVoteAria: string
  mostDeceptiveAria: string
  familyAdultsAria: string
  shareCardResultAria: string
  loadingText: string
  brandLabel: string

  // How to Play
  howToPlayTitle: string
  howToPlayIntro: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string
  step4Title: string
  step4Desc: string
  step5Title: string
  step5Desc: string

  // About Developer
  aboutTitle: string
  aboutGreeting: string
  aboutName: string
  aboutNameEn: string
  aboutRole: string
  aboutBio: string
  aboutSignature: string
}

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
  navLegalPrivacy: string
  navLegalTerms: string
  navLegalRefund: string

  // Bottom navigation
  navStore: string
  navVoting: string
  navPlay: string
  navNotifications: string
  navProfile: string

  // Coming soon placeholder screens
  comingSoonTitle: string
  comingSoonSubtitle: string

  // Settings panel
  settingsTitle: string
  settingsLegalLabel: string

  // Play / Home screen
  playOnline: string
  playCreatePrivate: string

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

  lobbyRecommendedRounds: string
  lobbyUseRecommended: string
  lobbyWatchOnTv: string
  lobbyDisplayCount: string
  lobbyDisplayCountOne: string

  tournamentModeLabel: string
  tournamentModeDesc: string
  tournamentGameLabel: string
  tournamentStandingsTitle: string
  tournamentPlayNextGame: string
  tournamentOverallWinner: string
  tournamentFinalStandings: string

  categoryCompletionTitle: string
  categoryCompletionSeen: string

  categoryUnlockSectionTitle: string
  categoryExpansionSectionTitle: string
  categoryLocked: string

  displayScreenWaiting: string
  displayJoinFailed: string
  displayFull: string

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
  answerScreenPictureRound: string
  answeredCount: string
  charCount: string

  // Answer Revision Modal
  answerRevisionTitle: string
  answerRevisionBody: string
  answerRevisionEditButton: string
  answerRevisionSubmitAnyway: string

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

  // Splash screen
  splashTagline: string

  // Share card canvas text
  shareCardTitle: string
  shareCardSubtitle: string
  shareCardRank: string
  shareCardOutOf: string
  shareCardPlayerLabel: string
  shareCardScoreLabel: string

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

  // About Creator & Credits
  aboutCreatorName: string
  aboutCreatorBio: string
  aboutCreditsTitle: string
  aboutCreditsBody: string

  // Player connection status
  playerDisconnected: string

  // Store
  storeSectionAvatarsDesc: string
  storeSectionEffectsDesc: string
  storeSectionFramesDesc: string
  storeItemSfxArcadeName: string
  storeItemSfxArcadeDesc: string
  storeItemSfxRetroName: string
  storeItemSfxRetroDesc: string
  storeItemSfxSoftName: string
  storeItemSfxSoftDesc: string
  storeItemFrameGoldName: string
  storeItemFrameGoldDesc: string
  storeItemFrameNeonName: string
  storeItemFrameNeonDesc: string
  storeItemFrameFireName: string
  storeItemFrameFireDesc: string
  storeItemFrameRoyalName: string
  storeItemFrameRoyalDesc: string
  storeInsufficientFunds: string
  storePurchaseSuccess: string
  storeBuyButton: string
  storeOwnedLabel: string
  storeBuyCoinsTitle: string
  storeBuyCoinsDesc: string
  storeTierSmallLabel: string
  storeTierMediumLabel: string
  storeTierLargeLabel: string
  storeTierAmount: string
  storeTierPrice: string
  storeTierMediumBonus: string
  storeTierLargeBonus: string
  storePaymentProcessing: string
  storePaymentCancelled: string
  storeCoinsPurchaseSuccess: string
  storeCancelButton: string

  // Hall of Fame
  hallOfFameTitle: string
  hallOfFameSubtitle: string
  hallOfFameVoteButton: string
  hallOfFameEmpty: string

  // Notifications
  notificationsCoinsEarned: string
  notificationsEmpty: string

  // Profile
  profileNicknameLabel: string
  profileCoinsLabel: string
  profileInventoryTitle: string
  profileEditButton: string
  profileSaveButton: string
  profileCancelButton: string
  profileEditAria: string
  profileSaveAria: string
  profileCancelAria: string

  // Settings
  settingsCloseAria: string

  // App Store descriptions
  appShortDescription: string
  appLongDescription: string

  // Legal pages
  legalPrivacyTitle: string
  legalPrivacyBody: string
  legalTermsTitle: string
  legalTermsBody: string
  legalRefundTitle: string
  legalRefundBody: string

  // Growth / shareability nudges
  gameOverShareNudge: string
  hallOfFameShareCaption: string
  lobbyInviteNudge: string

  // Connection / timeout
  requestTimeout: string
  requestRetry: string

  // Premium
  navPremium: string
  premiumBadgeAria: string
  premiumScreenTitle: string
  premiumTagline: string
  premiumMonthlyLabel: string
  premiumYearlyLabel: string
  premiumYearlySavings: string
  premiumSubscribeButton: string
  premiumCurrentPlanLabel: string
  premiumCancelButton: string
  premiumExpiresLabel: string
  premiumNotAvailable: string
  premiumFeature1: string
  premiumFeature2: string
  premiumFeature3: string
  premiumFeature4: string
  premiumFeature5: string
  premiumLockedBadge: string
  premiumUpsellNudge: string
  premiumMonthlyPrice: string
  premiumYearlyPrice: string

  // Premium
  premiumSubscribeSuccess: string

  // Auth / Login-choice screen
  authTitle: string
  authGuestButton: string
  authLoginButton: string
  authGuestDescription: string
  authLoginDescription: string
  authOrDivider: string

  // Account recovery screen (email -> code -> restore)
  authRecoverTitle: string
  authRecoverEmailLabel: string
  authRecoverEmailPlaceholder: string
  authRecoverSendCodeButton: string
  authRecoverCodeSentNotice: string
  authRecoverCodeLabel: string
  authRecoverCodePlaceholder: string
  authRecoverVerifyButton: string
  authRecoverBackButton: string
  authRecoverEmailNotConfigured: string
  authRecoverInvalidCode: string
  authRecoverSuccess: string

  // Avatar part display names (bodies 1-4)
  avatarBody01: string
  avatarBody02: string
  avatarBody03: string
  avatarBody04: string

  // Avatar part display names (bodies 5-14)
  avatarBody05: string
  avatarBody06: string
  avatarBody07: string
  avatarBody08: string
  avatarBody09: string
  avatarBody10: string
  avatarBody11: string
  avatarBody12: string
  avatarBody13: string
  avatarBody14: string

  // Avatar part display names (eyes 1-8)
  avatarEyes01: string
  avatarEyes02: string
  avatarEyes03: string
  avatarEyes04: string
  avatarEyes05: string
  avatarEyes06: string
  avatarEyes07: string
  avatarEyes08: string

  // Avatar part display names (eyes 9-18)
  avatarEyes09: string
  avatarEyes10: string
  avatarEyes11: string
  avatarEyes12: string
  avatarEyes13: string
  avatarEyes14: string
  avatarEyes15: string
  avatarEyes16: string
  avatarEyes17: string
  avatarEyes18: string

  // Avatar part display names (hats — original free+premium hats)
  avatarHatNone: string
  avatarHatParty: string
  avatarHatCap: string
  avatarHatHeadband: string
  avatarHatCrown: string
  avatarHatTophat: string
  avatarHatWizard: string
  avatarHatPropeller: string
  avatarHatSombrero: string
  avatarHatViking: string

  // Avatar part display names (hats — new free hats)
  avatarHatBeret: string
  avatarHatCowboy: string
  avatarHatHood: string
  avatarHatBandana: string
  avatarHatHelmet: string
  avatarHatFez: string
  avatarHatFlower: string
  avatarHatAntenna: string
  avatarHatCrownFlower: string
  avatarHatHeadwrap: string

  // Profile
  profileInventoryEmpty: string
  profileTabBody: string
  profileTabEyes: string
  profileTabHat: string

  // Relative timestamps
  relativeTimeJustNow: string
  relativeTimeMinutesAgo: string
  relativeTimeHoursAgo: string
  relativeTimeDaysAgo: string

  // Store section titles (premium eyes/hats)
  storePremiumEyesTitle: string
  storePremiumEyesDesc: string
  storePremiumHatsTitle: string
  storePremiumHatsDesc: string

  // Store item display names
  storeItemEyesHeart: string
  storeItemEyesStar: string
  storeItemEyesFire: string
  storeItemEyesSpiral: string
  storeItemEyesGalaxy: string
  storeItemHatCrown: string
  storeItemHatTophat: string
  storeItemHatWizard: string
  storeItemHatPropeller: string
  storeItemHatSombrero: string
  storeItemHatViking: string
  storeItemHatHalo: string
  storeItemFrameDiamond: string
}

import type { Translations } from './types'

const en: Translations = {
  lang: 'en',
  langLabel: 'EN',
  dir: 'ltr',

  navHome: 'Home',
  navHowToPlay: 'How to Play',
  navAbout: 'About',
  navLegalPrivacy: 'Privacy Policy',
  navLegalTerms: 'Terms of Service',
  navLegalRefund: 'Refund Policy',

  navStore: 'Store',
  navVoting: 'Voting',
  navPlay: 'Play',
  navNotifications: 'Notifications',
  navProfile: 'Profile',

  comingSoonTitle: 'Coming Soon',
  comingSoonSubtitle: "This feature is under construction — stay tuned!",

  settingsTitle: 'Settings',
  settingsLegalLabel: 'Legal',
  settingsCloseAria: 'Close settings',

  playOnline: 'Play Online',
  playCreatePrivate: 'Create Private Room',

  welcomeTitle: 'KALAKO',
  welcomeSubtitle: 'A party trivia game full of lies, bluffing, and laughs',
  createRoom: 'Create Room',
  joinRoom: 'Join with Code',
  welcomeTagline: 'Bring the lies, have fun with friends!',

  createRoomTitle: 'Create Room',
  createRoomNameLabel: 'Room Name',
  createRoomNamePlaceholder: 'Friday Night Chaos',
  back: '← Back',
  yourName: 'Your Name',
  yourNamePlaceholder: 'Enter your name...',
  privateRoom: 'Private Room (Invite Only)',
  privateRoomDesc: '',
  answerTime: 'Answer Time',
  rounds: 'Number of Rounds',
  categories: 'Categories',
  advancedOptions: 'Advanced Options',
  scoreMultiplier: 'Score Multiplier',
  scoreMultiplierDesc: 'Double points in some rounds',
  blindVote: 'Blind Vote',
  blindVoteDesc: 'You won\'t see who voted for you',
  adultsOnly: 'Adults Only',
  adultsOnlyDesc: 'Mature content',
  createRoomBtn: 'Create Room',
  sec: 'sec',
  answerTime30: '30 sec',
  answerTime45: '45 sec',
  answerTime60: '60 sec',
  answerTime90: '90 sec',
  rounds3: '3 Rounds',
  rounds5: '5 Rounds',
  rounds7: '7 Rounds',
  rounds10: '10 Rounds',

  joinRoomTitle: 'Join Room',
  roomCode: 'Room Code',
  roomCodePlaceholder: 'e.g. ABC123',
  joinRoomBtn: 'Join Room',

  lobbyTitle: 'Lobby',
  privateBadge: '🔒 Private',
  publicBadge: '🌐 Public',
  roomCodeLabel: 'Room Code',
  copyCode: '📋 Copy Code',
  copiedCode: '✓ Copied',
  copyLink: '🔗 Copy Link',
  copiedLink: '✓ Copied',
  scanToJoin: 'Scan to join',
  players: 'Players',
  timeLabel: 'Time',
  roundsLabel: 'Rounds',
  startGame: 'Start Game',
  playerCount: 'player',
  waitingForHost: 'Waiting for host to start...',
  leaveRoom: 'Leave Room',
  playersCount: 'Players ({{count}})',
  timeFormat: '{{seconds}}s time',
  roundsFormat: '{{count}} rounds',

  lobbyRecommendedRounds: 'Recommended: {{count}} rounds for {{players}} players',
  lobbyUseRecommended: 'Use recommended',
  lobbyWatchOnTv: 'Watch on TV',
  lobbyDisplayCount: '{{count}} watching',
  lobbyDisplayCountOne: '1 watching',

  tournamentModeLabel: 'Tournament (best of 3 games)',
  tournamentModeDesc: 'Same room plays 3 games in a row with cumulative standings',
  tournamentGameLabel: 'Game {{current}} of {{total}}',
  tournamentStandingsTitle: 'Tournament Standings',
  tournamentPlayNextGame: 'Play Game {{next}} of {{total}}',
  tournamentOverallWinner: 'Overall Winner',
  tournamentFinalStandings: 'Final Tournament Standings',

  categoryCompletionTitle: 'Category Progress',
  categoryCompletionSeen: '{{seen}}/{{total}} seen',

  categoryUnlockSectionTitle: 'Category Unlocks',
  categoryExpansionSectionTitle: 'Category Expansions',
  categoryLocked: 'Locked — unlock in the Store',
  storeCategoryUnlockName: 'Unlock {{categoryName}}',
  storeCategoryUnlockDesc: 'Permanent access to {{categoryName}} — play it forever, no coins needed.',
  storeCategoryExpansionName: '+100 {{categoryName}} Questions',
  storeCategoryExpansionDesc: 'More questions, more lies, more chaos.',

  displayScreenWaiting: 'Waiting for the game to start...',
  displayJoinFailed: 'Could not join as a display — check the code and try again.',
  displayFull: 'This room already has the maximum number of watching screens.',
  displaySpectatorBadge: 'Watching',
  reactionsPickerAria: 'Pick a reaction',

  suggestQuestionFormTitle: 'Suggest a Question',
  suggestQuestionCategoryLabel: 'Category',
  suggestQuestionQuestionLabel: 'Your Question',
  suggestQuestionAnswerLabel: 'The Answer',
  suggestQuestionSubmitButton: 'Submit',
  suggestQuestionThankYou: 'Thanks! Your question is in the review queue.',

  swapQuestionButtonLabel: 'New Question',
  freezeRoundButtonLabel: '❄️ Freeze',
  freezeRoundUsedTooltip: 'Already used this round',
  freezeRoundSuccessToast: '+10 seconds! Nice save.',

  categoryPickTitle: 'Pick a Category',
  pickCategoryHost: 'Choose a category for this round',
  pickCategoryWaiting: 'Waiting for host to pick a category...',
  tiebreaker: '⚡ Tiebreaker Round',

  round: 'Round',
  doublePoints: '⚡ ×2 Points',
  questionLoading: 'Loading question...',
  answerPlaceholder: 'Type your answer here...',
  submitAnswer: 'Submit Answer',
  answerSubmitted: '✓ Your answer has been recorded',
  answerScreenPictureRound: '📷 Picture Round',
  answeredCount: 'answered',
  charCount: '{{count}}/140',

  answerRevisionTitle: 'That might give you away!',
  answerRevisionBody: 'The question calls for a sneaky answer. If yours is too accurate, opponents will spot it instantly. Try something more deceptive.',
  answerRevisionEditButton: 'Let me edit it',
  answerRevisionSubmitAnyway: 'Submit it anyway',

  voteTitle: 'Which one is correct?',
  voteSubtitle: 'Pick the answer you think is real — answers are hidden without names',
  yourAnswer: '(Your answer)',
  voteSubmitted: '✓ Your vote has been recorded',
  votedCount: 'voted',

  roundResults: 'Round Results',
  correctAnswer: 'Correct Answer',
  answersAndVotes: 'Answers & Votes',
  votes: 'votes',
  points: 'points',
  standings: 'Standings',

  gameOverTitle: 'Game Over!',
  finalStandings: 'Final Standings',
  saveImage: '📸 Save as Image',
  exit: 'Exit',
  youLabel: '(You)',
  medal1: '🥇',
  medal2: '🥈',
  medal3: '🥉',

  reconnecting: 'Reconnecting...',
  reconnectingSub: 'Trying to connect to the server',

  devPreviewTitle: 'Asset Preview',
  devPreviewBack: 'Back to app',
  devPreviewLogos: '1. Logos',
  devPreviewAvatars: '2. Avatars (16 × 3 states)',
  devPreviewCategoryIcons: '3. Category Icons',
  devPreviewExtraIcons: '4. Extra Icons',
  devPreviewSoundFx: '5. Sound Effects (Web Audio)',
  devPreviewQrCode: '6. Themed QR Code',
  devPreviewShareCard: '7. Results Share Card',
  devPreviewSplash: '8. Splash Screen (Preview)',
  devPreviewLobbyBg: '9. Lobby Background',
  devPreviewHorizontal: 'Horizontal',
  devPreviewSquare: 'Square',
  devPreviewJoin: 'Join',
  devPreviewCountdown: 'Countdown',
  devPreviewSubmit: 'Submit',
  devPreviewVote: 'Vote',
  devPreviewCorrect: 'Correct',
  devPreviewTricked: 'Tricked',
  devPreviewWin: 'Win',
  devPreviewScoreMultiplier: 'Score Multiplier',
  devPreviewBlindVote: 'Blind Vote',
  devPreviewMostDeceptive: 'Most Deceptive',
  devPreviewFamily: 'Family',
  devPreviewAdults: 'Adults',
  devPreviewSubtitle: 'Mono Teal Theme — تحدي الإجابات',
  devPreviewWithNeon: 'With Neon Frame',
  devPreviewSmall: 'Small',

  logoHorizontalAria: 'Kalako — logo',
  logoSquareAria: 'Kalako — app icon',
  splashAria: 'Kalako loading screen',
  lobbyBgAria: 'Lobby background',
  timerAria: '{{seconds}} seconds remaining',
  scoreMultiplierAria: 'Score Multiplier',
  blindVoteAria: 'Blind Vote',
  mostDeceptiveAria: 'Most Deceptive',
  familyAdultsAria: '{{variant}}',
  shareCardResultAria: '{{name}} result: {{score}} points - Rank {{rank}}',
  loadingText: 'Loading...',
  brandLabel: 'kalako.app',

  logoSubtitle: 'Kalako',

  splashTagline: 'The Answer Challenge',
  shareCardTitle: 'Kalako',
  shareCardSubtitle: 'A group deception game',
  shareCardRank: 'Rank {{rank}}',
  shareCardOutOf: 'Out of {{total}}',
  shareCardPlayerLabel: 'Player',
  shareCardScoreLabel: 'Score',

  howToPlayTitle: 'How to Play?',
  howToPlayIntro: 'A group deception game — outsmart your friends!',
  step1Title: 'Create or Join',
  step1Desc: 'Create a room and share the code with friends, or join with an existing code.',
  step2Title: 'Pick a Category',
  step2Desc: 'The host picks a category for each round from 8 diverse categories.',
  step3Title: 'Write a Lie',
  step3Desc: 'See the question and write an answer you think others will pick — the more convincing, the more points.',
  step4Title: 'Vote for Truth',
  step4Desc: 'Review all answers and pick the one you think is real. Answers are hidden without names.',
  step5Title: 'Score Points',
  step5Desc: 'Correct guessers get a point, and so do those who fooled others! Deception is an art.',

  aboutTitle: 'About the Developer',
  aboutGreeting: 'HELLO',
  aboutName: 'Muhammed Awesat',
  aboutNameEn: 'Muhammed Awesat',
  aboutRole: 'Creator of Kalako',
  aboutBio: 'A passionate developer building interactive experiences that bring people together. Kalako is one of my favorite projects — a group deception game that entertains friends and challenges minds.',
  aboutSignature: 'Made with love ❤️',

  aboutCreatorName: 'Muhammed Awesat',
  aboutCreatorBio: 'A passionate developer building interactive experiences that bring people together. Kalako is one of my favorite projects — a group deception game that entertains friends and challenges minds.',
  aboutCreditsTitle: 'Credits',
  aboutCreditsBody: 'Built with love, late-night coffee, and the open-source community. Special thanks to everyone who played, tested, and contributed ideas along the way.',
  playerDisconnected: 'Disconnected',

  storeSectionAvatarsDesc: 'Express yourself with dozens of quirky character looks.',
  storeSectionEffectsDesc: 'Win sounds, confetti bursts, and glorious victory vibes.',
  storeSectionFramesDesc: 'Deck out your share cards with killer neon frames.',
  storeItemSfxArcadeName: 'Arcade Classics',
  storeItemSfxArcadeDesc: 'Old-school beeps, boops, and victory jingles.',
  storeItemSfxRetroName: 'Retro Rewind',
  storeItemSfxRetroDesc: 'Cassette pops, chiptune wins, and 8-bit glory.',
  storeItemSfxSoftName: 'Smooth Operator',
  storeItemSfxSoftDesc: 'Chill chimes, gentle pings, and zen vibes only.',
  storeItemFrameGoldName: 'Gold Digger',
  storeItemFrameGoldDesc: 'Shiny gold border that screams winner energy.',
  storeItemFrameNeonName: 'Neon Nights',
  storeItemFrameNeonDesc: 'Glowing neon frame — your card, but louder.',
  storeItemFrameFireName: 'Fire Starter',
  storeItemFrameFireDesc: 'Fiery frame for answers that absolutely slap.',
  storeItemFrameRoyalName: 'Royal Flush',
  storeItemFrameRoyalDesc: 'Purple and gold royalty for the true kings of lies.',
  storeInsufficientFunds: 'Not enough coins yet — keep playing!',
  storePurchaseSuccess: 'Nice! It\'s yours now.',
  storeBuyButton: 'Buy',
  storeOwnedLabel: 'Owned',
  storeBuyCoinsTitle: 'Buy Coins',
  storeBuyCoinsDesc: 'Top up your coin balance with a one-time purchase.',
  storeTierSmallLabel: 'Starter Pack',
  storeTierMediumLabel: 'Fun Pack',
  storeTierLargeLabel: 'Mega Pack',
  storeTierAmount: '{{coins}} coins',
  storeTierPrice: '${{price}}',
  storeTierMediumBonus: '+{{bonus}} bonus',
  storeTierLargeBonus: '+{{bonus}} bonus',
  storePaymentProcessing: 'Processing payment...',
  storePaymentCancelled: 'Payment cancelled — no coins charged.',
  storeCoinsPurchaseSuccess: '{{coins}} coins added! 🎉',
  storeCancelButton: 'Cancel',
  storePaymentUnavailable: 'Payment system not configured yet.',
  storeGiftPremiumButton: 'Gift Premium',
  giftCodeGeneratedMessage: 'Gift code ready — share it with a friend!',
  redeemCodeLabel: 'Redeem Code',
  redeemCodeButton: 'Redeem',
  redeemSuccessMessage: 'Enjoy your gift! 🎉',
  redeemInvalidCodeError: "That code doesn't exist or was already used.",
  giftToFriendButton: 'Gift to a Friend',
  giftRecipientTagLabel: "Friend's Tag",
  giftItemSelectPlaceholder: 'Choose an item to gift...',
  giftSuccessMessage: 'Gift sent! 🎁',
  hallOfFameTitle: 'Hall of Fame',
  hallOfFameSubtitle: 'The funniest lies that fooled the most people — voted by the community.',
  hallOfFameVoteButton: 'Upvote',
  hallOfFameEmpty: 'No legendary lies yet. Play a round and let the greatness begin!',
  notificationsCoinsEarned: 'You earned {{amount}} coins! 🎉',
  notificationsGiftReceived: 'You received {{itemName}} from {{senderTag}}! 🎁',
  notificationsEmpty: 'No notifications yet.',
  profileNicknameLabel: 'Nickname',
  profileCoinsLabel: 'Coins',
  profileInventoryTitle: 'Your Inventory',
  profileEditButton: 'Edit',
  profileSaveButton: 'Save',
  profileCancelButton: 'Cancel',
  profileEditAria: 'Edit nickname',
  profileSaveAria: 'Save nickname',
  profileCancelAria: 'Cancel editing',
  profilePlayerTagLabel: 'Player Tag',
  profileCopyTagButton: 'Copy',

  appShortDescription: 'Lie, bluff, and outsmart your friends in a hilarious group trivia game.',
  appLongDescription: 'Kalako is a social party game where the best liar wins. Write fake answers to trick your friends, vote on which answer you think is real, and score points for every person you fool. With 8 categories and endless laughs, it\'s the ultimate game night companion.',

  legalPrivacyTitle: 'Privacy Policy',
  legalPrivacyBody: `Last updated: July 2026

DISCLAIMER: This is general-purpose privacy policy text for a small independent game. It has not been reviewed by a lawyer. We recommend professional legal review before scaling to real large-scale payment processing, especially given cross-border considerations (operator based in Israel, PayPal involves international users).

What We Collect

Kalako is a party trivia game that runs in your web browser. We keep data collection to a minimum:

• Device ID — A random identifier generated and stored on your device. This is used to link your game profile (nickname, avatar, coins, items) across sessions. It is not your real identity and cannot be traced back to you personally.

• Nickname — A name you choose yourself when creating a room. Not your real name.

• Avatar choices — Visual customizations you select in the game.

• Coin balance and purchase history — Tracks your in-game currency and cosmetic item purchases.

• Real purchases — When you buy coins through PayPal, PayPal processes the payment. Kalako never sees, stores, or has access to your credit card number, bank account details, or PayPal password. PayPal sends us only a transaction confirmation (transaction ID and amount) so we can credit your coins.

We do NOT collect: email addresses, real names, passwords, phone numbers, photos, location data, or browsing history.

How We Use Your Data

Your data is used solely to operate the game — creating rooms, tracking scores, managing your coin balance, and delivering purchased items. We do not sell, share, or trade your data with advertisers, data brokers, or third parties. PayPal receives only the minimum information necessary to process your payment.

Where Your Data Is Stored

Game data is stored on the operator's own server and locally on your device via browser storage. For real-money purchases, PayPal maintains its own transaction records according to PayPal's own privacy policy.

Your Rights

You can request deletion of all your data at any time by opening an issue at https://github.com/muhamedaw/kalako2/issues with the subject "Data Deletion Request" and mentioning your device ID. The operator will remove all associated data within 30 days.

Changes to This Policy

This privacy policy may be updated from time to time. Changes will be posted on the GitHub repository at https://github.com/muhamedaw/kalako2.`,

  legalTermsTitle: 'Terms of Service',
  legalTermsBody: `Last updated: July 2026

DISCLAIMER: This is general-purpose terms of service text for a small independent game. It has not been reviewed by a lawyer. We recommend professional legal review before scaling to real large-scale payment processing, especially given cross-border considerations (operator based in Israel, PayPal involves international users).

About the Service

Kalako is a free online party trivia and bluffing game. It is designed for a general audience. A family-friendly content filter is available and can be enabled when creating a room.

User Conduct

Players choose their own nicknames and write answers during gameplay. You agree to keep all content respectful. No harassment, hate speech, slurs, sexually explicit content, or content that targets individuals or groups. The operator reserves the right to remove inappropriate content and ban players who repeatedly violate these standards.

Virtual Coins

Coins earned by playing have no real-world cash value. They cannot be exchanged for money, transferred to other players, or refunded. Coins exist solely as an in-game currency for purchasing cosmetic items.

Purchases

Real-money coin purchases are processed through PayPal. PayPal's own terms of service apply to the payment transaction. Kalako does not guarantee uninterrupted payment processing and is not responsible for PayPal-side issues.

Service Availability

The game is provided "as-is" without warranties of any kind. We do not guarantee uninterrupted uptime or error-free operation. The operator reserves the right to modify, suspend, or discontinue features at any time without prior notice.

Disputes

Any disputes arising from use of the game should be raised directly with the operator via GitHub issues at https://github.com/muhamedaw/kalako2/issues. These terms are governed by the laws of the State of Israel.`,

  legalRefundTitle: 'Refund Policy',
  legalRefundBody: `Last updated: July 2026

DISCLAIMER: This is general-purpose refund policy text for a small independent game. It has not been reviewed by a lawyer. We recommend professional legal review before scaling to real large-scale payment processing, especially given cross-border considerations (operator based in Israel, PayPal involves international users).

General Policy

Coin purchases in Kalako are digital goods delivered immediately to your game account. Once coins have been credited to your account, purchases are generally non-refundable.

Exceptions

If you experience a genuine technical error — for example, your PayPal account was charged but the coins were not delivered to your game account — please contact the operator. The operator will investigate and correct verified errors within 7 business days.

PayPal Disputes

If you believe a payment was made in error, you may also open a dispute through PayPal's own resolution process. PayPal's buyer protection policies apply to the payment transaction independently of this refund policy.

Contact

To request a refund or report a payment issue, open an issue at https://github.com/muhamedaw/kalako2/issues with the subject "Refund Request" and include your transaction details. The operator will respond within 7 business days.

Fair Note

The operator is committed to resolving genuine issues fairly. While refunds are not guaranteed beyond what is described above, the operator will review each case individually.`,

  gameOverShareNudge: 'Rank {{rank}} out of {{totalPlayers}} — save your card and show them who won.',
  hallOfFameShareCaption: 'I fooled {{trickedCount}} people with this lie on Kalako — think you can do better?',
  lobbyInviteNudge: 'More players, more lies to untangle. Invite someone before you start.',

  requestTimeout: 'Request timed out — check your connection',
  requestRetry: 'Something went wrong. Please try again.',

  navPremium: 'Premium',
  premiumBadgeAria: 'Premium member',
  premiumScreenTitle: 'Kalako Premium',
  premiumTagline: 'Play like a VIP. Your lies deserve a bigger stage.',
  premiumMonthlyLabel: 'Monthly',
  premiumYearlyLabel: 'Yearly',
  premiumYearlySavings: 'Save 44%',
  premiumSubscribeButton: 'Get Premium',
  premiumCurrentPlanLabel: 'You\'re Premium',
  premiumCancelButton: 'Cancel',
  premiumExpiresLabel: 'Expires {{date}}',
  premiumNotAvailable: '',
  premiumFeature1: 'Every future expansion pack, included — picture rounds, new categories, and more, without spending a single coin.',
  premiumFeature2: '500 bonus coins dropped into your account every month you\'re subscribed. Fuel for your best bluffs.',
  premiumFeature3: '3 exclusive cosmetic items you literally cannot get any other way — hat, eyes, and a frame that scream Premium.',
  premiumFeature4: 'Host rooms of up to 30 players instead of 20. More people to fool, more chaos to enjoy.',
  premiumFeature5: 'A shiny Premium badge follows you into every lobby, every result screen, every leaderboard. Let them know who they\'re dealing with.',
  premiumLockedBadge: 'Premium',
  premiumUpsellNudge: 'That one\'s a Premium perk — worth a look?',
  premiumMonthlyPrice: '$2.99/mo',
  premiumYearlyPrice: '$19.99/yr',
  premiumSubscribeSuccess: 'Premium activated! Welcome to the club.',

  // Auth / Login-choice screen
  authTitle: 'Welcome to Kalako',
  authGuestButton: 'Play as Guest',
  authLoginButton: 'Sign In',
  authGuestDescription: 'Jump in without an account — no strings attached.',
  authLoginDescription: 'Save your progress, stats, and purchases.',
  authOrDivider: 'or',

  authRecoverTitle: 'Recover Your Account',
  authRecoverEmailLabel: 'Email address',
  authRecoverEmailPlaceholder: 'you@example.com',
  authRecoverSendCodeButton: 'Send Code',
  authRecoverCodeSentNotice: 'If that email is linked to an account, a code is on its way.',
  authRecoverSendError: 'Could not connect. Please check your connection and try again.',
  authRecoverCodeLabel: '6-digit code',
  authRecoverCodePlaceholder: '000000',
  authRecoverVerifyButton: 'Verify & Restore',
  authRecoverBackButton: 'Back',
  authRecoverEmailNotConfigured: 'Account recovery isn\'t available yet — check back soon.',
  authRecoverInvalidCode: 'That code is invalid or expired.',
  authRecoverSuccess: 'Account restored! Welcome back.',

  purchaseEmailNudgeTitle: 'Don\'t lose this purchase',
  purchaseEmailNudgeBody: 'Add a recovery email so you never lose this purchase — it links your coins and items to your account if you ever switch devices.',
  purchaseAddEmailButton: 'Add Email',
  purchaseSkipButton: 'Skip, continue anyway',
  purchaseEmailVerifyButton: 'Verify & Link',
  purchaseEmailLinkedSuccess: 'Email linked! Your purchase is protected now.',
  purchaseEmailInvalidCode: 'That code is invalid or expired.',
  purchaseEmailNotConfigured: 'Email linking isn\'t available yet — continuing without it.',
  purchaseEmailSentNotice: 'Code sent — check your inbox.',
  purchaseEmailRateLimited: 'Too many attempts — try again later.',

  // Avatar part display names (bodies 1-4)
  avatarBody01: 'Plum Puff',
  avatarBody02: 'Coral Cutie',
  avatarBody03: 'Lime Chunk',
  avatarBody04: 'Cream Dream',

  // Avatar part display names (bodies 5-14)
  avatarBody05: 'Mint Munch',
  avatarBody06: 'Lilac Bop',
  avatarBody07: 'Peach Smirk',
  avatarBody08: 'Teal Boop',
  avatarBody09: 'Blush Plop',
  avatarBody10: 'Amber Nudge',
  avatarBody11: 'Sage Wink',
  avatarBody12: 'Rose Bump',
  avatarBody13: 'Sky Doodle',
  avatarBody14: 'Cocoa Bounce',

  // Avatar part display names (eyes 1-8)
  avatarEyes01: 'Round Blink',
  avatarEyes02: 'Wide Wonder',
  avatarEyes03: 'Sleepy Squint',
  avatarEyes04: 'Big Sparkle',
  avatarEyes05: 'Heart Eyes',
  avatarEyes06: 'Star Eyes',
  avatarEyes07: 'Fire Eyes',
  avatarEyes08: 'Spiral Eyes',

  // Avatar part display names (eyes 9-18)
  avatarEyes09: 'Star Gaze',
  avatarEyes10: 'Dreamy Drop',
  avatarEyes11: 'Pixel Peep',
  avatarEyes12: 'Moon Peek',
  avatarEyes13: 'Fizzy Blink',
  avatarEyes14: 'Neon Squint',
  avatarEyes15: 'Cosmic Stare',
  avatarEyes16: 'Jelly Glint',
  avatarEyes17: 'Vapor Drift',
  avatarEyes18: 'Spark Dart',
  avatarEyesPremium05: 'Twinkle Burst',
  avatarEyesPremium06: 'Lovestruck',
  avatarEyesPremium07: 'Hypno Gaze',
  avatarEyesPremium08: 'Sly Wink',

  // Avatar part display names (hats — original free+premium hats)
  avatarHatNone: 'No Hat',
  avatarHatParty: 'Party Hat',
  avatarHatCap: 'Cap',
  avatarHatHeadband: 'Headband',
  avatarHatCrown: 'Crown',
  avatarHatTophat: 'Top Hat',
  avatarHatWizard: 'Wizard Hat',
  avatarHatPropeller: 'Propeller Beanie',
  avatarHatSombrero: 'Sombrero',
  avatarHatViking: 'Viking Helmet',

  // Avatar part display names (hats — new free hats)
  avatarHatBeret: 'Beret Babe',
  avatarHatCowboy: 'Cowboy Cutie',
  avatarHatHood: 'Cozy Hood',
  avatarHatBandana: 'Bandana Buddy',
  avatarHatHelmet: 'Safety first!',
  avatarHatFez: 'Fez Fella',
  avatarHatFlower: 'Bloom Top',
  avatarHatAntenna: 'Signal Boost',
  avatarHatCrownFlower: 'Petal Crown',
  avatarHatHeadwrap: 'Wrap Star',
  avatarHatPremium07: 'Halo Vibes',
  avatarHatPremium08: 'Beat Drop',
  avatarHatPremium09: 'Bunny Bop',
  avatarHatPremium10: 'Star Burst',

  // Profile
  profileInventoryEmpty: 'Nothing here yet — check the Store!',
  profileTabBody: 'Body',
  profileTabEyes: 'Eyes',
  profileTabHat: 'Hat',

  // Relative timestamps
  relativeTimeJustNow: 'just now',
  relativeTimeMinutesAgo: '{{mins}}m ago',
  relativeTimeHoursAgo: '{{hours}}h ago',
  relativeTimeDaysAgo: '{{days}}d ago',

  // Store section titles (premium eyes/hats)
  storePremiumEyesTitle: 'Premium Eyes',
  storePremiumEyesDesc: 'Expressive eyes to make your avatar pop.',
  storePremiumHatsTitle: 'Premium Hats',
  storePremiumHatsDesc: 'Top off your look with a stylish lid.',

  // Store item display names
  storeItemEyesHeart: 'Heart Eyes',
  storeItemEyesStar: 'Star Eyes',
  storeItemEyesFire: 'Fire Eyes',
  storeItemEyesSpiral: 'Spiral Eyes',
  storeItemEyesGalaxy: 'Galaxy Eyes',
  storeItemHatCrown: 'Crown',
  storeItemHatTophat: 'Top Hat',
  storeItemHatWizard: 'Wizard Hat',
  storeItemHatPropeller: 'Propeller Beanie',
  storeItemHatSombrero: 'Sombrero',
  storeItemHatViking: 'Viking Helmet',
  storeItemHatHalo: 'Halo',
  storeItemFrameDiamond: 'Diamond Frame',
}

export default en

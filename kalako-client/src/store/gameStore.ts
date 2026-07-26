import { create } from 'zustand'
import type { Screen, EconomyProfile, StoreSection, HallOfFameEntry, NotificationItem } from '@/types'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { getDeviceId } from '@/lib/deviceId'

export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  connected: boolean
  isPremium?: boolean
}

export interface Room {
  code: string
  hostId: string
  phase: string
  round: number
  isTiebreakerRound: boolean
  settings: {
    isPrivate: boolean
    answerTimeSeconds: number
    roundsCount: number
    allowedCategories: string[]
    familyMode: boolean
    doublePointsRoundEnabled: boolean
    blindVotingEnabled: boolean
  }
  players: Player[]
}

export interface VoteSlot {
  slotId: string
  text: string
}

export interface RoundResultAnswer {
  playerId: string
  playerName: string
  text: string
  votesReceived: number
  pointsAwarded: number
}

export interface GameState {
  screen: Screen
  room: Room | null
  playerId: string | null
  playerName: string | null
  language: string
  categoryOptions: string[]
  questionText: string | null
  questionCategory: string | null
  questionImageUrl: string | null
  questionSourceAttribution: string | null
  timeSeconds: number
  voteSlots: VoteSlot[]
  mySlotId: string | null
  roundResults: {
    correctAnswer: string
    answers: RoundResultAnswer[]
    scores: Player[]
  } | null
  finalStandings: { id: string; name: string; score: number }[] | null
  mostDeceptivePlayer: { id: string; name: string; timesFooledOthers: number } | null
  isDoublePointsRound: boolean
  wasDoublePoints: boolean
  isConnected: boolean
  isReconnecting: boolean
  submittedAnswer: boolean
  submittedVote: boolean
  serverError: string | null
  pendingJoinCode: string | undefined
  answeredCount: number
  totalPlayers: number
  votedCount: number
  answerNeedsRevision: { questionId: string } | null

  // Premium
  isPremium: boolean
  premiumExpiresAt: string | null

  // Economy
  profile: EconomyProfile | null
  catalog: StoreSection[]
  hallOfFame: HallOfFameEntry[]
  notifications: NotificationItem[]
  unreadCount: number
  catalogLoading: boolean
  hallOfFameLoading: boolean
  notificationsLoading: boolean
}

export interface GameActions {
  setScreen: (s: Screen) => void
  connect: () => void
  disconnect: () => void
  createRoom: (name: string, settings: {
    isPrivate: boolean
    answerTimeSeconds: number
    roundsCount: number
    allowedCategories: string[]
    scoreMultiplierEnabled?: boolean
    isBlindVote?: boolean
    ageRating?: 'all' | 'adults'
  }) => void
  joinRoom: (code: string, name: string) => void
  startGame: () => void
  pickCategory: (cat: string) => void
  submitAnswer: (text: string, forceSubmit?: boolean) => void
  clearAnswerNeedsRevision: () => void
  submitVote: (slotId: string) => void
  leaveRoom: () => void
  setError: (msg: string | null) => void
  setLanguage: (lng: string) => void

  // Economy actions
  loadProfile: () => void
  updateProfileNickname: (nickname: string) => void
  updateProfileAvatar: (avatarConfig: { body: string; eyes: string; hat: string }) => void
  loadCatalog: () => void
  buyItem: (itemId: string) => Promise<{ success?: boolean; error?: string; coins?: number }>
  loadHallOfFame: () => void
  voteHallOfFameEntry: (entryId: string) => void
  loadNotifications: () => void
  markNotificationRead: (notificationId: string) => void
  loadUnreadCount: () => void
  clearUnreadCount: () => void
  createPayPalOrder: (tierId: string) => Promise<{ orderId?: string; error?: string }>
  capturePayPalOrder: (paypalOrderId: string, tierId: string) => void

  // Premium
  loadPremiumStatus: () => void
  createPremiumSubscription: (plan: 'monthly' | 'yearly') => Promise<{ approvalUrl?: string; error?: string }>
  cancelPremiumSubscription: () => void
}

const STORAGE_KEY_PLAYER_ID = 'kalako_playerId'
const STORAGE_KEY_ROOM_CODE = 'kalako_roomCode'
const STORAGE_KEY_PLAYER_NAME = 'kalako_playerName'
const STORAGE_KEY_LANGUAGE = 'kalako_language'

function persistSession(playerId: string, roomCode: string, playerName: string, language: string) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_ID, playerId)
    localStorage.setItem(STORAGE_KEY_ROOM_CODE, roomCode)
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, playerName)
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language)
  } catch { /* private browsing */ }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY_PLAYER_ID)
    localStorage.removeItem(STORAGE_KEY_ROOM_CODE)
    localStorage.removeItem(STORAGE_KEY_PLAYER_NAME)
  } catch { /* ignore */ }
}

function loadSession() {
  try {
    return {
      playerId: localStorage.getItem(STORAGE_KEY_PLAYER_ID),
      roomCode: localStorage.getItem(STORAGE_KEY_ROOM_CODE),
      playerName: localStorage.getItem(STORAGE_KEY_PLAYER_NAME),
      language: localStorage.getItem(STORAGE_KEY_LANGUAGE),
    }
  } catch {
    return { playerId: null, roomCode: null, playerName: null, language: null }
  }
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  screen: 'welcome',
  room: null,
  playerId: null,
  playerName: null,
  language: 'ar',
  categoryOptions: [],
  questionText: null,
  questionCategory: null,
  questionImageUrl: null,
  questionSourceAttribution: null,
  timeSeconds: 30,
  voteSlots: [],
  mySlotId: null,
  roundResults: null,
  finalStandings: null,
  isConnected: false,
  isReconnecting: false,
  submittedAnswer: false,
  submittedVote: false,
  serverError: null,
  pendingJoinCode: undefined,
  answeredCount: 0,
  totalPlayers: 0,
  votedCount: 0,
  mostDeceptivePlayer: null,
  isDoublePointsRound: false,
  wasDoublePoints: false,
  answerNeedsRevision: null,
  isPremium: false,
  premiumExpiresAt: null,
  profile: null,
  catalog: [],
  hallOfFame: [],
  notifications: [],
  unreadCount: 0,
  catalogLoading: false,
  hallOfFameLoading: false,
  notificationsLoading: false,

  setScreen: (s) => set({ screen: s }),
  setError: (msg) => set({ serverError: msg }),
  clearAnswerNeedsRevision: () => set({ answerNeedsRevision: null }),

  setLanguage: (lng) => {
    set({ language: lng })
    persistSession(get().playerId || '', get().room?.code || '', get().playerName || '', lng)
  },

  connect: () => {
    const socket = getSocket()

    socket.off()

    socket.on('connect', () => {
      set({ isConnected: true, isReconnecting: false })

      socket.emit('get_unread_count', { deviceId: getDeviceId() }, (res: any) => {
        if (res?.count !== undefined) set({ unreadCount: res.count })
      })

      const saved = loadSession()
      if (saved.playerId && saved.roomCode && saved.playerName) {
        set({ language: saved.language || 'ar', isReconnecting: true })
        socket.emit('join_room', {
          roomCode: saved.roomCode,
          playerName: saved.playerName,
          playerId: saved.playerId,
          language: saved.language || 'ar',
        }, (response: any) => {
          if (response.error) {
            clearSession()
            set({ isReconnecting: false, screen: 'welcome' })
            return
          }
          set({
            room: response.room,
            playerId: response.playerId,
            isReconnecting: false,
          })
        })
      }
    })

    socket.on('connect_error', () => {
      const state = get()
      if (state.room) {
        set({ isReconnecting: true })
      }
    })

    socket.on('disconnect', () => {
      const state = get()
      if (state.room) {
        set({ isReconnecting: true })
      } else {
        set({ isConnected: false })
      }
    })

    socket.on('player_joined', (data: { player: { id: string; name: string }; room: Room }) => {
      set({ room: data.room })
    })

    socket.on('player_left', (data: { playerId: string; room: Room }) => {
      set({ room: data.room })
    })

    socket.on('player_reconnected', (data: { playerId: string; room: Room }) => {
      set({ room: data.room, isReconnecting: false })
    })

    socket.on('player_disconnected', (data: { playerId: string; room: Room }) => {
      set({ room: data.room })
    })

    // Lightweight, purely informational — fires immediately in every phase (before the
    // heavier full-room broadcasts above), so any screen showing player status updates
    // right away instead of waiting on a phase-specific event.
    socket.on('player_connection_changed', (data: { playerId: string; status: 'disconnected' | 'reconnected' }) => {
      const room = get().room
      if (!room) return
      set({
        room: {
          ...room,
          players: room.players.map((p) =>
            p.id === data.playerId ? { ...p, connected: data.status === 'reconnected' } : p
          ),
        },
      })
    })

    socket.on('answer_progress', (data: { answeredCount: number; totalPlayers: number }) => {
      set({ answeredCount: data.answeredCount, totalPlayers: data.totalPlayers })
    })

    socket.on('vote_progress', (data: { votedCount: number; totalPlayers: number }) => {
      set({ votedCount: data.votedCount, totalPlayers: data.totalPlayers })
    })

    socket.on('your_answer_slot', (data: { slotId: string }) => {
      set({ mySlotId: data.slotId })
    })

    socket.on('answer_needs_revision', (data: { questionId: string }) => {
      set({ answerNeedsRevision: data })
    })

    socket.on('phase_changed', (data: any) => {
      const phase = data.phase as string
      const room = data.room as Room

      if (phase === 'LOBBY') {
        set({ screen: 'lobby', room, submittedAnswer: false, submittedVote: false })
      } else if (phase === 'CATEGORY_PICK') {
        set({
          screen: 'category_pick',
          room,
          categoryOptions: data.categoryOptions || [],
          submittedAnswer: false,
          submittedVote: false,
          questionText: null,
          voteSlots: [],
          mySlotId: null,
          roundResults: null,
          answeredCount: 0,
          totalPlayers: 0,
          votedCount: 0,
        })
      } else if (phase === 'ANSWERING') {
        set({
          screen: 'answering',
          room,
          questionText: data.question?.text || null,
          questionCategory: data.question?.category || null,
          questionImageUrl: data.question?.imageUrl || null,
          questionSourceAttribution: data.question?.sourceAttribution || null,
          timeSeconds: data.timeSeconds || room.settings.answerTimeSeconds,
          submittedAnswer: false,
          submittedVote: false,
          voteSlots: [],
          mySlotId: null,
          roundResults: null,
          answeredCount: 0,
          totalPlayers: 0,
          votedCount: 0,
          isDoublePointsRound: Boolean(data.isDoublePointsRound),
        })
      } else if (phase === 'VOTING') {
        set({
          screen: 'voting',
          room,
          voteSlots: data.answers || [],
          submittedVote: false,
          roundResults: null,
          answeredCount: 0,
          totalPlayers: 0,
          votedCount: 0,
        })
      } else if (phase === 'RESULTS') {
        set({
          screen: 'round_results',
          room,
          roundResults: data.results || null,
          submittedAnswer: false,
          submittedVote: false,
          wasDoublePoints: Boolean(data.results?.wasDoublePoints),
        })
      } else if (phase === 'GAME_OVER') {
        clearSession()
        set({
          screen: 'game_over',
          room,
          finalStandings: data.finalStandings || null,
          mostDeceptivePlayer: data.mostDeceptivePlayer || null,
          submittedAnswer: false,
          submittedVote: false,
        })
      }
    })

    if (!socket.connected) {
      socket.connect()
    }
  },

  disconnect: () => {
    disconnectSocket()
    clearSession()
    set({
      room: null,
      playerId: null,
      screen: 'welcome',
      questionText: null,
      voteSlots: [],
      roundResults: null,
      finalStandings: null,
      isConnected: false,
      isReconnecting: false,
      questionCategory: null,
      questionImageUrl: null,
      questionSourceAttribution: null,
      categoryOptions: [],
      mySlotId: null,
      answeredCount: 0,
      totalPlayers: 0,
      votedCount: 0,
    })
  },

  createRoom: (name, settings) => {
    set({ playerName: name })
    const socket = getSocket()
    socket.emit('create_room', {
      playerName: name,
      language: get().language,
      isPrivate: settings.isPrivate,
      answerTimeSeconds: settings.answerTimeSeconds,
      roundsCount: settings.roundsCount,
      allowedCategories: settings.allowedCategories,
      doublePointsRoundEnabled: settings.scoreMultiplierEnabled ?? false,
      blindVotingEnabled: settings.isBlindVote ?? false,
      familyMode: (settings.ageRating ?? 'all') !== 'adults',
    }, (response: any) => {
      if (response.error) {
        set({ serverError: response.error })
        return
      }
      const playerId = response.playerId as string
      const roomCode = response.room.code as string
      persistSession(playerId, roomCode, name, get().language)
      set({
        room: response.room,
        playerId,
        screen: 'lobby',
        serverError: null,
      })
    })
  },

  joinRoom: (code, name) => {
    set({ playerName: name, serverError: null })
    const socket = getSocket()
    socket.emit('join_room', {
      roomCode: code,
      playerName: name,
      language: get().language,
    }, (response: any) => {
      if (response.error) {
        set({ serverError: response.error })
        return
      }
      const playerId = response.playerId as string
      persistSession(playerId, code, name, get().language)
      set({
        room: response.room,
        playerId,
        screen: 'lobby',
        isReconnecting: false,
      })
    })
  },

  startGame: () => {
    set({ serverError: null })
    const socket = getSocket()
    socket.emit('start_game', (response: any) => {
      if (response?.error) set({ serverError: response.error })
    })
  },

  pickCategory: (cat) => {
    const socket = getSocket()
    socket.emit('pick_category', { category: cat })
  },

  submitAnswer: (text, forceSubmit = false) => {
    const socket = getSocket()
    set({ answerNeedsRevision: null })
    socket.emit('submit_answer', { text, forceSubmit }, (res: any) => {
      if (res?.ok) set({ submittedAnswer: true })
      // if res.needsRevision, the separate 'answer_needs_revision' event (already
      // wired above) sets answerNeedsRevision — submittedAnswer stays false so the
      // revision modal's guard condition can actually show it.
    })
  },

  submitVote: (slotId) => {
    const socket = getSocket()
    socket.emit('submit_vote', { slotId })
    set({ submittedVote: true })
  },

  leaveRoom: () => {
    const socket = getSocket()
    socket.emit('leave_room')
    clearSession()
    set({
      room: null,
      playerId: null,
      screen: 'welcome',
      questionText: null,
      voteSlots: [],
      roundResults: null,
      finalStandings: null,
      questionCategory: null,
      questionImageUrl: null,
      questionSourceAttribution: null,
      categoryOptions: [],
      mySlotId: null,
      answeredCount: 0,
      totalPlayers: 0,
      votedCount: 0,
    })
  },

  // ─── Economy Actions ───

  loadProfile: () => {
    const socket = getSocket()
    socket.emit('get_or_create_profile', { deviceId: getDeviceId() }, (res: any) => {
      if (res?.error) return
      set({ profile: res, isPremium: res.isPremium ?? false, premiumExpiresAt: res.premiumExpiresAt ?? null })
    })
  },

  updateProfileNickname: (nickname) => {
    const socket = getSocket()
    socket.emit('update_profile', { deviceId: getDeviceId(), nickname }, (res: any) => {
      if (res?.error) return
      if (res?.nickname) set({ profile: res })
    })
  },
  updateProfileAvatar: (avatarConfig) => {
    const socket = getSocket()
    socket.emit('update_profile', { deviceId: getDeviceId(), avatarConfig }, (res: any) => {
      if (res?.error) return
      set({ profile: res })
    })
  },

  loadCatalog: () => {
    set({ catalogLoading: true })
    const socket = getSocket()
    socket.emit('get_store_catalog', {}, (res: any) => {
      set({ catalog: res || [], catalogLoading: false })
    })
  },

  buyItem: (itemId) => {
    const socket = getSocket()
    // Real event name is 'purchase_item' — it was 'buy_item' here, which the server has
    // never listened for since an earlier rename, so every purchase silently no-op'd
    // while the UI still showed a success toast regardless (see StoreScreen's caller).
    return new Promise((resolve) => {
      socket.emit('purchase_item', { deviceId: getDeviceId(), itemId }, (res: any) => {
        if (res?.success) {
          set((s) => ({
            profile: s.profile ? { ...s.profile, coins: res.coins, inventory: res.inventory } : null,
          }))
        }
        resolve(res || { error: 'no_response' })
      })
    })
  },

  loadHallOfFame: () => {
    set({ hallOfFameLoading: true })
    const socket = getSocket()
    socket.emit('get_hall_of_fame', {}, (res: any) => {
      set({ hallOfFame: res || [], hallOfFameLoading: false })
    })
  },

  voteHallOfFameEntry: (entryId) => {
    const socket = getSocket()
    socket.emit('vote_hall_of_fame', { deviceId: getDeviceId(), entryId }, (res: any) => {
      if (res?.success) {
        set((s) => ({
          hallOfFame: s.hallOfFame.map((e) =>
            e.id === entryId ? { ...e, voteCount: res.newVoteCount } : e
          ),
        }))
      }
    })
  },

  loadNotifications: () => {
    set({ notificationsLoading: true })
    const socket = getSocket()
    socket.emit('get_notifications', { deviceId: getDeviceId() }, (res: any) => {
      set({ notifications: res || [], notificationsLoading: false })
    })
  },

  markNotificationRead: (notificationId) => {
    const socket = getSocket()
    socket.emit('mark_notification_read', { notificationId })
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  loadUnreadCount: () => {
    const socket = getSocket()
    socket.emit('get_unread_count', { deviceId: getDeviceId() }, (res: any) => {
      if (res?.count !== undefined) set({ unreadCount: res.count })
    })
  },

  clearUnreadCount: () => set({ unreadCount: 0 }),

  createPayPalOrder: (tierId) => {
    return new Promise((resolve) => {
      const socket = getSocket()
      socket.emit('create_paypal_order', { deviceId: getDeviceId(), tierId }, (res: any) => {
        resolve(res || { error: 'no_response' })
      })
    })
  },

  capturePayPalOrder: (paypalOrderId, tierId) => {
    const socket = getSocket()
    socket.emit('capture_paypal_order', { deviceId: getDeviceId(), paypalOrderId, tierId }, (res: any) => {
      if (res?.success && res?.newCoinBalance !== undefined) {
        set((s) => ({
          profile: s.profile ? { ...s.profile, coins: res.newCoinBalance } : null,
        }))
      }
    })
  },

  // ─── Premium Actions ───

  loadPremiumStatus: () => {
    const socket = getSocket()
    socket.emit('get_premium_status', { deviceId: getDeviceId() }, (res: any) => {
      if (res?.isPremium !== undefined) {
        set({ isPremium: res.isPremium, premiumExpiresAt: res.expiresAt ?? null })
      }
    })
  },

  createPremiumSubscription: (plan) => {
    return new Promise((resolve) => {
      const socket = getSocket()
      socket.emit('create_premium_subscription', { deviceId: getDeviceId(), plan }, (res: any) => {
        resolve(res || { error: 'no_response' })
      })
    })
  },

  cancelPremiumSubscription: () => {
    const socket = getSocket()
    socket.emit('cancel_premium_subscription', { deviceId: getDeviceId() }, (res: any) => {
      if (res?.success) {
        set({ isPremium: false, premiumExpiresAt: null })
      }
    })
  },
}))

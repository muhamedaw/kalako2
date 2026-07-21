import { create } from 'zustand'
import type { Screen } from '@/types'
import { getSocket, disconnectSocket } from '@/lib/socket'

export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  connected: boolean
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
  categoryOptions: string[]
  questionText: string | null
  questionCategory: string | null
  timeSeconds: number
  voteSlots: VoteSlot[]
  mySlotId: string | null
  roundResults: {
    correctAnswer: string
    answers: RoundResultAnswer[]
    scores: Player[]
  } | null
  finalStandings: { id: string; name: string; score: number }[] | null
  isConnected: boolean
  isReconnecting: boolean
  submittedAnswer: boolean
  submittedVote: boolean
  serverError: string | null
  pendingJoinCode: string | undefined
  answeredCount: number
  totalPlayers: number
  votedCount: number
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
  }) => void
  joinRoom: (code: string, name: string) => void
  startGame: () => void
  pickCategory: (cat: string) => void
  submitAnswer: (text: string) => void
  submitVote: (slotId: string) => void
  leaveRoom: () => void
  setError: (msg: string | null) => void
}

const STORAGE_KEY_PLAYER_ID = 'kalako_playerId'
const STORAGE_KEY_ROOM_CODE = 'kalako_roomCode'
const STORAGE_KEY_PLAYER_NAME = 'kalako_playerName'

function persistSession(playerId: string, roomCode: string, playerName: string) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_ID, playerId)
    localStorage.setItem(STORAGE_KEY_ROOM_CODE, roomCode)
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, playerName)
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
    }
  } catch {
    return { playerId: null, roomCode: null, playerName: null }
  }
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  screen: 'welcome',
  room: null,
  playerId: null,
  playerName: null,
  categoryOptions: [],
  questionText: null,
  questionCategory: null,
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

  setScreen: (s) => set({ screen: s }),
  setError: (msg) => set({ serverError: msg }),

  connect: () => {
    const socket = getSocket()

    socket.off()

    socket.on('connect', () => {
      set({ isConnected: true, isReconnecting: false })

      const saved = loadSession()
      if (saved.playerId && saved.roomCode && saved.playerName) {
        set({ isReconnecting: true })
        socket.emit('join_room', {
          roomCode: saved.roomCode,
          playerName: saved.playerName,
          playerId: saved.playerId,
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

    socket.on('answer_progress', (data: { answeredCount: number; totalPlayers: number }) => {
      set({ answeredCount: data.answeredCount, totalPlayers: data.totalPlayers })
    })

    socket.on('vote_progress', (data: { votedCount: number; totalPlayers: number }) => {
      set({ votedCount: data.votedCount, totalPlayers: data.totalPlayers })
    })

    socket.on('your_answer_slot', (data: { slotId: string }) => {
      set({ mySlotId: data.slotId })
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
          timeSeconds: data.timeSeconds || room.settings.answerTimeSeconds,
          submittedAnswer: false,
          submittedVote: false,
          voteSlots: [],
          mySlotId: null,
          roundResults: null,
          answeredCount: 0,
          totalPlayers: 0,
          votedCount: 0,
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
        })
      } else if (phase === 'GAME_OVER') {
        clearSession()
        set({
          screen: 'game_over',
          room,
          finalStandings: data.finalStandings || null,
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
      isPrivate: settings.isPrivate,
      answerTimeSeconds: settings.answerTimeSeconds,
      roundsCount: settings.roundsCount,
      allowedCategories: settings.allowedCategories,
    }, (response: any) => {
      if (response.error) {
        set({ serverError: response.error })
        return
      }
      const playerId = response.playerId as string
      const roomCode = response.room.code as string
      persistSession(playerId, roomCode, name)
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
    }, (response: any) => {
      if (response.error) {
        set({ serverError: response.error })
        return
      }
      const playerId = response.playerId as string
      persistSession(playerId, code, name)
      set({
        room: response.room,
        playerId,
        screen: 'lobby',
        isReconnecting: false,
      })
    })
  },

  startGame: () => {
    const socket = getSocket()
    socket.emit('start_game')
  },

  pickCategory: (cat) => {
    const socket = getSocket()
    socket.emit('pick_category', { category: cat })
  },

  submitAnswer: (text) => {
    const socket = getSocket()
    socket.emit('submit_answer', { text })
    set({ submittedAnswer: true })
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
      categoryOptions: [],
      mySlotId: null,
      answeredCount: 0,
      totalPlayers: 0,
      votedCount: 0,
    })
  },
}))

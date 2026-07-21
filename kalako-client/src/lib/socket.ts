import { io, Socket } from 'socket.io-client'

export type TypedSocket = Socket

let socket: TypedSocket | null = null

export function getSocket(): TypedSocket {
  if (socket) return socket

  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001'

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 30,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

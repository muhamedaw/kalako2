import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { config } from './config.mts'
import { registerSocketHandlers } from './socket/index.mts'
import { initDb } from './db/index.mts'

export async function createApp() {
  await initDb()

  const app = express()
  app.use(cors({ origin: config.corsOrigin }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] },
  })

  registerSocketHandlers(io)

  return { app, httpServer, io }
}

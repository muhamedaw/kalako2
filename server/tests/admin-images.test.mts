import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

// Split out from admin.test.mts: these two tests make real outbound fetch() calls to
// validate image URLs, and running them in the same process as the rest of the admin suite
// reproducibly hung the whole run (each of these two calls independently completes in
// under 300ms in isolation — a Node/undici fetch-keep-alive interaction across
// node:test's sequential tests in one process, not a bug in admin.mts itself).
process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-adminimg-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.JOIN_BASE_URL = 'http://localhost:0'
process.env.ADMIN_PASSWORD = 'test-admin-secret-123'

const { createApp } = await import('../src/server.mts')

async function startServer() {
  const { httpServer } = await createApp()
  await new Promise<void>((resolve) => httpServer.listen(0, resolve))
  const address = httpServer.address()
  const port = typeof address === 'object' && address ? address.port : 0
  return { httpServer, port }
}

function waitFor<T = any>(socket: ClientSocket, event: string, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for "${event}"`)), ms)
    socket.once(event, (payload: T) => {
      clearTimeout(timer)
      resolve(payload)
    })
  })
}

function ackCall<T = any>(socket: ClientSocket, event: string, payload: any): Promise<T> {
  return new Promise((resolve) => socket.emit(event, payload, resolve))
}

async function authenticatedClient(url: string): Promise<{ client: ClientSocket; token: string }> {
  const client = ioClient(url, { transports: ['websocket'] })
  await waitFor(client, 'connect')
  const res = await ackCall(client, 'admin_authenticate', { password: 'test-admin-secret-123' })
  return { client, token: res.sessionToken }
}

test('admin_add_question: rejects a non-image URL clearly, never silently saves it', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const res = await ackCall(client, 'admin_add_question', {
    sessionToken: token, categoryId: 'sports', language: 'en',
    questionText: 'Bad image test', correctAnswer: 'x', ageRating: 'family',
    imageUrl: 'https://example.com/this-is-an-html-page-not-an-image',
  })
  assert.equal(res.error?.startsWith('Image URL rejected'), true, JSON.stringify(res))

  const listed = await ackCall(client, 'admin_list_questions', { sessionToken: token, categoryId: 'sports', language: 'en' })
  assert.equal(listed.some((q: any) => q.text === 'Bad image test'), false)
})

test('admin_add_question: accepts a real image URL', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const res = await ackCall(client, 'admin_add_question', {
    sessionToken: token, categoryId: 'picture', language: 'en',
    questionText: 'Admin-added picture question', correctAnswer: 'Wikipedia logo', ageRating: 'family',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png',
    sourceAttribution: 'Wikimedia Commons',
  })
  assert.equal(res.success, true, JSON.stringify(res))
  assert.equal(res.question.imageUrl, 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png')

  // Inline, not t.after: an async t.after callback that awaits a socket ack
  // (ackCall) reproducibly hangs node:test's hook runner in this codebase.
  await ackCall(client, 'admin_delete_question', { sessionToken: token, questionId: res.question.id, categoryId: 'picture', language: 'en' })
})

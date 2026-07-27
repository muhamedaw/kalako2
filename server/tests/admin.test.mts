import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-admin-${crypto.randomUUID()}.sqlite`)
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

test('admin_authenticate: wrong password rejected, correct password issues a session token', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const wrong = await ackCall(client, 'admin_authenticate', { password: 'nope' })
  assert.equal(wrong.success, false)
  assert.equal(wrong.error, 'invalid_password')

  const right = await ackCall(client, 'admin_authenticate', { password: 'test-admin-secret-123' })
  assert.equal(right.success, true)
  assert.ok(typeof right.sessionToken === 'string' && right.sessionToken.length > 20)
})

test('admin_authenticate: rate limited after repeated attempts', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const results = []
  for (let i = 0; i < 7; i++) {
    results.push(await ackCall(client, 'admin_authenticate', { password: 'nope' }))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'))
})

test('admin_* events reject an invalid/missing session token', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res1 = await ackCall(client, 'admin_list_categories', {})
  assert.equal(res1.error, 'unauthorized')
  const res2 = await ackCall(client, 'admin_list_categories', { sessionToken: 'totally-made-up' })
  assert.equal(res2.error, 'unauthorized')
})

test('admin_list_categories: returns existing categories with per-language counts', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const categories = await ackCall(client, 'admin_list_categories', { sessionToken: token })
  assert.ok(Array.isArray(categories))
  const sports = categories.find((c: any) => c.id === 'sports')
  assert.ok(sports)
  assert.ok(sports.counts.en > 0)
  assert.equal(sports.displayNames.en, 'Sports')
})

test('admin_add_category + admin_add_question: new category playable immediately, no restart needed', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const newCatId = `admintest_${crypto.randomBytes(3).toString('hex')}`
  const questionsDir = path.join(process.cwd(), 'src', 'data', 'questions')
  const categoryMetaPath = path.join(process.cwd(), 'src', 'data', 'categoryMeta.json')
  t.after(() => {
    // This test creates real files on disk (same mechanism a real admin write uses) --
    // clean them up so the test suite never leaves permanent junk in the real question bank.
    for (const lang of ['ar', 'en', 'he']) {
      const p = path.join(questionsDir, lang, `${newCatId}.json`)
      if (fs.existsSync(p)) fs.unlinkSync(p)
    }
    try {
      const meta = JSON.parse(fs.readFileSync(categoryMetaPath, 'utf-8'))
      delete meta[newCatId]
      fs.writeFileSync(categoryMetaPath, JSON.stringify(meta, null, 2), 'utf-8')
    } catch { /* best-effort cleanup */ }
  })

  const addCatRes = await ackCall(client, 'admin_add_category', {
    sessionToken: token, id: newCatId, displayNames: { ar: 'اختبار', en: 'Admin Test', he: 'בדיקה' },
  })
  assert.equal(addCatRes.success, true)

  // Immediately usable in a real room, same process, no restart.
  const host = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => host.close())
  await waitFor(host, 'connect')
  const room = await ackCall(host, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 1, playerName: 'Host', language: 'en',
    allowedCategories: [newCatId],
  })
  assert.deepEqual(room.room.settings.allowedCategories, [newCatId])

  // Add a question to it and confirm it can actually be picked.
  const addQRes = await ackCall(client, 'admin_add_question', {
    sessionToken: token, categoryId: newCatId, language: 'en',
    questionText: 'What is the admin test question?', correctAnswer: 'This one', ageRating: 'family',
  })
  assert.equal(addQRes.success, true)
  assert.ok(addQRes.question.id)

  const listed = await ackCall(client, 'admin_list_questions', { sessionToken: token, categoryId: newCatId, language: 'en' })
  assert.equal(listed.length, 1)
  assert.equal(listed[0].text, 'What is the admin test question?')
})

// Image-URL validation tests (reject non-image, accept real image) live in
// admin-images.test.mts — see the comment there for why they're split out.

test('admin_edit_question: edits reflected in next room immediately, no restart needed', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const addRes = await ackCall(client, 'admin_add_question', {
    sessionToken: token, categoryId: 'sports', language: 'en',
    questionText: 'Original text', correctAnswer: 'Original answer', ageRating: 'family',
  })
  const questionId = addRes.question.id

  const editRes = await ackCall(client, 'admin_edit_question', {
    sessionToken: token, questionId, categoryId: 'sports', language: 'en',
    questionText: 'Edited text', correctAnswer: 'Edited answer',
  })
  assert.equal(editRes.success, true)
  assert.equal(editRes.question.text, 'Edited text')

  const listed = await ackCall(client, 'admin_list_questions', { sessionToken: token, categoryId: 'sports', language: 'en' })
  const found = listed.find((q: any) => q.id === questionId)
  assert.equal(found.text, 'Edited text')
  assert.equal(found.answer, 'Edited answer')

  // Inline, not t.after: an async t.after callback that awaits a socket ack
  // (ackCall) reproducibly hangs node:test's hook runner in this codebase.
  await ackCall(client, 'admin_delete_question', { sessionToken: token, questionId, categoryId: 'sports', language: 'en' })
})

test('admin_delete_question: removed immediately, gone from future listing', { timeout: 15000 }, async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const { client, token } = await authenticatedClient(`http://localhost:${port}`)
  t.after(() => client.close())

  const addRes = await ackCall(client, 'admin_add_question', {
    sessionToken: token, categoryId: 'sports', language: 'en',
    questionText: 'To be deleted', correctAnswer: 'x', ageRating: 'family',
  })
  const questionId = addRes.question.id

  const deleteRes = await ackCall(client, 'admin_delete_question', {
    sessionToken: token, questionId, categoryId: 'sports', language: 'en',
  })
  assert.equal(deleteRes.success, true)

  const listed = await ackCall(client, 'admin_list_questions', { sessionToken: token, categoryId: 'sports', language: 'en' })
  assert.equal(listed.some((q: any) => q.id === questionId), false)

  const doubleDelete = await ackCall(client, 'admin_delete_question', {
    sessionToken: token, questionId, categoryId: 'sports', language: 'en',
  })
  assert.equal(doubleDelete.error, 'Question not found')
})

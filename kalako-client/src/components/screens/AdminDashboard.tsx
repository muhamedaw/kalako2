import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'

// Internal-only tool: hidden behind ?admin=true (never linked from normal nav),
// gated by a server-validated session token, plain English UI — no game theme,
// no i18n, no animation needed. See server/src/socket/admin.mts for the backend.

type Lang = 'ar' | 'en' | 'he'
const LANGUAGES: Lang[] = ['ar', 'en', 'he']

interface CategoryRow {
  id: string
  displayNames: { ar: string; en: string; he: string }
  counts: { ar: number; en: number; he: number }
}

interface QuestionRow {
  id: string
  category: string
  text: string
  answer: string
  ageRating: 'family' | 'adult'
  imageUrl?: string
  sourceAttribution?: string
}

function ackCall<T = any>(event: string, payload: any): Promise<T> {
  return new Promise((resolve) => getSocket().emit(event, payload, resolve))
}

interface ToastMsg { id: string; text: string; kind: 'success' | 'error' }

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authenticating, setAuthenticating] = useState(false)

  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const notify = (text: string, kind: ToastMsg['kind'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Lang>('en')
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const [newCatId, setNewCatId] = useState('')
  const [newCatAr, setNewCatAr] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [newCatHe, setNewCatHe] = useState('')

  const [qText, setQText] = useState('')
  const [qAnswer, setQAnswer] = useState('')
  const [qAgeRating, setQAgeRating] = useState<'family' | 'adult'>('family')
  const [qImageUrl, setQImageUrl] = useState('')
  const [qAttribution, setQAttribution] = useState('')
  const [addingQuestion, setAddingQuestion] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editAnswer, setEditAnswer] = useState('')

  async function loadCategories(sessionToken: string) {
    setLoadingCategories(true)
    const res = await ackCall<CategoryRow[]>('admin_list_categories', { sessionToken })
    setLoadingCategories(false)
    if (Array.isArray(res)) {
      setCategories(res)
      if (!selectedCategory && res.length > 0) setSelectedCategory(res[0].id)
    } else {
      notify('Failed to load categories', 'error')
    }
  }

  async function loadQuestions(sessionToken: string, categoryId: string, language: Lang) {
    setLoadingQuestions(true)
    const res = await ackCall<QuestionRow[]>('admin_list_questions', { sessionToken, categoryId, language })
    setLoadingQuestions(false)
    if (Array.isArray(res)) setQuestions(res)
    else notify('Failed to load questions', 'error')
  }

  useEffect(() => {
    if (token && selectedCategory) loadQuestions(token, selectedCategory, selectedLanguage)
  }, [token, selectedCategory, selectedLanguage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticating(true)
    setAuthError(null)
    const res = await ackCall<{ success: boolean; sessionToken?: string; error?: string }>('admin_authenticate', { password })
    setAuthenticating(false)
    if (res.success && res.sessionToken) {
      setToken(res.sessionToken)
      loadCategories(res.sessionToken)
    } else {
      setAuthError(res.error === 'rate_limited' ? 'Too many attempts — wait a moment and try again.' : 'Wrong password.')
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const id = newCatId.trim()
    if (!id || !newCatAr.trim() || !newCatEn.trim() || !newCatHe.trim()) {
      notify('Fill in category id and all three display names', 'error')
      return
    }
    const res = await ackCall<{ success: boolean; error?: string }>('admin_add_category', {
      sessionToken: token, id, displayNames: { ar: newCatAr.trim(), en: newCatEn.trim(), he: newCatHe.trim() },
    })
    if (res.success) {
      notify(`Category "${id}" added`)
      setNewCatId(''); setNewCatAr(''); setNewCatEn(''); setNewCatHe('')
      loadCategories(token)
    } else {
      notify(res.error || 'Failed to add category', 'error')
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selectedCategory) return
    if (!qText.trim() || !qAnswer.trim()) {
      notify('Question text and correct answer are required', 'error')
      return
    }
    setAddingQuestion(true)
    const res = await ackCall<{ success: boolean; question?: QuestionRow; error?: string }>('admin_add_question', {
      sessionToken: token, categoryId: selectedCategory, language: selectedLanguage,
      questionText: qText.trim(), correctAnswer: qAnswer.trim(), ageRating: qAgeRating,
      imageUrl: qImageUrl.trim() || undefined, sourceAttribution: qAttribution.trim() || undefined,
    })
    setAddingQuestion(false)
    if (res.success) {
      notify('Question added')
      setQText(''); setQAnswer(''); setQImageUrl(''); setQAttribution(''); setQAgeRating('family')
      loadQuestions(token, selectedCategory, selectedLanguage)
      loadCategories(token)
    } else {
      notify(res.error || 'Failed to add question', 'error')
    }
  }

  const startEdit = (q: QuestionRow) => {
    setEditingId(q.id)
    setEditText(q.text)
    setEditAnswer(q.answer)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (q: QuestionRow) => {
    if (!token || !selectedCategory) return
    const res = await ackCall<{ success: boolean; error?: string }>('admin_edit_question', {
      sessionToken: token, questionId: q.id, categoryId: selectedCategory, language: selectedLanguage,
      questionText: editText.trim(), correctAnswer: editAnswer.trim(),
    })
    if (res.success) {
      notify('Question updated')
      setEditingId(null)
      loadQuestions(token, selectedCategory, selectedLanguage)
    } else {
      notify(res.error || 'Failed to update question', 'error')
    }
  }

  const handleDelete = async (q: QuestionRow) => {
    if (!token || !selectedCategory) return
    if (!confirm(`Delete this question?\n\n"${q.text}"`)) return
    const res = await ackCall<{ success: boolean; error?: string }>('admin_delete_question', {
      sessionToken: token, questionId: q.id, categoryId: selectedCategory, language: selectedLanguage,
    })
    if (res.success) {
      notify('Question deleted')
      loadQuestions(token, selectedCategory, selectedLanguage)
      loadCategories(token)
    } else {
      notify(res.error || 'Failed to delete question', 'error')
    }
  }

  if (!token) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }} className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleAuthenticate} className="bg-white rounded-lg shadow p-6 w-full max-w-sm space-y-3">
          <h1 className="text-lg font-semibold text-gray-800">Kalako Admin</h1>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
          <button
            type="submit"
            disabled={authenticating || !password}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm disabled:opacity-50"
          >
            {authenticating ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }} className="min-h-screen bg-gray-100 p-4 md:p-6 space-y-6">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-sm text-white ${t.kind === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {t.text}
          </div>
        ))}
      </div>

      <h1 className="text-xl font-semibold text-gray-800">Kalako — Question Bank Admin</h1>

      <section className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="font-medium text-gray-700">Categories {loadingCategories && <span className="text-gray-400 text-xs">(loading…)</span>}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-1 pr-4">ID</th>
                <th className="py-1 pr-4">Display names</th>
                <th className="py-1 pr-4">AR</th>
                <th className="py-1 pr-4">EN</th>
                <th className="py-1 pr-4">HE</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`border-b cursor-pointer hover:bg-gray-50 ${selectedCategory === c.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-1 pr-4 font-mono">{c.id}</td>
                  <td className="py-1 pr-4 text-gray-600">{c.displayNames.en} / {c.displayNames.ar} / {c.displayNames.he}</td>
                  <td className="py-1 pr-4">{c.counts.ar}</td>
                  <td className="py-1 pr-4">{c.counts.en}</td>
                  <td className="py-1 pr-4">{c.counts.he}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2 pt-2 border-t">
          <input value={newCatId} onChange={(e) => setNewCatId(e.target.value)} placeholder="id (e.g. animals)" className="border rounded px-2 py-1 text-sm w-40" />
          <input value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} placeholder="English name" className="border rounded px-2 py-1 text-sm w-36" />
          <input value={newCatAr} onChange={(e) => setNewCatAr(e.target.value)} placeholder="Arabic name" className="border rounded px-2 py-1 text-sm w-36" />
          <input value={newCatHe} onChange={(e) => setNewCatHe(e.target.value)} placeholder="Hebrew name" className="border rounded px-2 py-1 text-sm w-36" />
          <button type="submit" className="bg-gray-800 text-white rounded px-3 py-1 text-sm">Add category</button>
        </form>
      </section>

      {selectedCategory && (
        <section className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-medium text-gray-700">
              Questions — <span className="font-mono">{selectedCategory}</span>
            </h2>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value as Lang)} className="border rounded px-2 py-1 text-sm">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            {loadingQuestions && <span className="text-gray-400 text-xs">loading…</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-1 pr-4">Text</th>
                  <th className="py-1 pr-4">Answer</th>
                  <th className="py-1 pr-4">Age</th>
                  <th className="py-1 pr-4">Image</th>
                  <th className="py-1 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b align-top">
                    {editingId === q.id ? (
                      <>
                        <td className="py-1 pr-4"><input value={editText} onChange={(e) => setEditText(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" /></td>
                        <td className="py-1 pr-4"><input value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" /></td>
                        <td className="py-1 pr-4">{q.ageRating}</td>
                        <td className="py-1 pr-4">{q.imageUrl && <img src={q.imageUrl} alt="" className="h-10 rounded" />}</td>
                        <td className="py-1 pr-4 whitespace-nowrap">
                          <button onClick={() => saveEdit(q)} className="text-green-700 mr-2">Save</button>
                          <button onClick={cancelEdit} className="text-gray-500">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-1 pr-4 max-w-xs">{q.text}</td>
                        <td className="py-1 pr-4">{q.answer}</td>
                        <td className="py-1 pr-4">{q.ageRating}</td>
                        <td className="py-1 pr-4">{q.imageUrl && <img src={q.imageUrl} alt="" className="h-10 rounded" />}</td>
                        <td className="py-1 pr-4 whitespace-nowrap">
                          <button onClick={() => startEdit(q)} className="text-blue-700 mr-2">Edit</button>
                          <button onClick={() => handleDelete(q)} className="text-red-700">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {questions.length === 0 && !loadingQuestions && (
                  <tr><td colSpan={5} className="py-3 text-gray-400">No questions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAddQuestion} className="pt-3 border-t space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Add question ({selectedLanguage})</h3>
            <textarea value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Question text" className="w-full border rounded px-2 py-1 text-sm" rows={2} />
            <input value={qAnswer} onChange={(e) => setQAnswer(e.target.value)} placeholder="Correct answer" className="w-full border rounded px-2 py-1 text-sm" />
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm flex items-center gap-1">
                <input type="checkbox" checked={qAgeRating === 'adult'} onChange={(e) => setQAgeRating(e.target.checked ? 'adult' : 'family')} />
                Adults only
              </label>
              <input value={qImageUrl} onChange={(e) => setQImageUrl(e.target.value)} placeholder="Image URL (optional, picture-round)" className="border rounded px-2 py-1 text-sm flex-1 min-w-[16rem]" />
              <input value={qAttribution} onChange={(e) => setQAttribution(e.target.value)} placeholder="Source attribution (optional)" className="border rounded px-2 py-1 text-sm flex-1 min-w-[12rem]" />
            </div>
            {qImageUrl.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <img src={qImageUrl.trim()} alt="preview" className="h-16 rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <button type="submit" disabled={addingQuestion} className="bg-gray-800 text-white rounded px-3 py-1.5 text-sm disabled:opacity-50">
              {addingQuestion ? 'Validating & saving…' : 'Add question'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}

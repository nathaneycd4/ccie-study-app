import type {
  ProgressResponse,
  StudySession,
  StudySessionCreate,
  TopicStats,
  CardWithReview,
  AnswerSubmit,
  AnswerResult,
  ChatMessage,
  Lab,
  LabCreate,
  LabAnswerKey,
  BlogPost,
  BlogPostCreate,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Progress ─────────────────────────────────────────────────────────────────

export const api = {
  progress: {
    get: () => request<ProgressResponse>('/progress/'),
    logSession: (data: StudySessionCreate) =>
      request<StudySession>('/progress/session', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listSessions: (limit = 20) =>
      request<StudySession[]>(`/progress/sessions?limit=${limit}`),
  },

  // ── Quiz ───────────────────────────────────────────────────────────────────

  quiz: {
    getTopics: () => request<TopicStats[]>('/quiz/topics'),
    getDeck: (topic: string) => request<CardWithReview[]>(`/quiz/deck/${encodeURIComponent(topic)}`),
    submitAnswer: (data: AnswerSubmit) =>
      request<AnswerResult>('/quiz/answer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStats: () => request<TopicStats[]>('/quiz/stats'),
  },

  // ── Chat ───────────────────────────────────────────────────────────────────

  chat: {
    getHistory: (sessionId: string) =>
      request<ChatMessage[]>(`/chat/history/${encodeURIComponent(sessionId)}`),
    clearHistory: (sessionId: string) =>
      request<{ cleared: boolean }>(`/chat/history/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      }),

    /** Returns a ReadableStream of SSE chunks. Caller handles streaming. */
    streamMessage: (sessionId: string, content: string): Promise<Response> => {
      return fetch(`${BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, content }),
      })
    },
  },

  // ── Labs ───────────────────────────────────────────────────────────────────

  labs: {
    create: (data: LabCreate) =>
      request<Lab>('/labs/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request<Lab[]>('/labs/'),
    get: (id: number) => request<Lab>(`/labs/${id}`),
    getAnswerKey: (id: number) => request<LabAnswerKey>(`/labs/${id}/answer-key`),
    delete: (id: number) =>
      request<{ deleted: boolean }>(`/labs/${id}`, { method: 'DELETE' }),
  },

  // ── Blog ───────────────────────────────────────────────────────────────────

  blog: {
    list: () => request<BlogPost[]>('/blog/'),
    get: (id: number) => request<BlogPost>(`/blog/${id}`),
    create: (data: BlogPostCreate) => request<BlogPost>('/blog/', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ deleted: boolean }>(`/blog/${id}`, { method: 'DELETE' }),
  },
}

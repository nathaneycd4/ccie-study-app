// ── Schedule / Progress ─────────────────────────────────────────────────────

export interface ModuleInfo {
  name: string
  start_date: string
  end_date: string
  week_number: number
  day_number: number
  total_days: number
  days_remaining: number
  is_current: boolean
}

export interface StudySession {
  id: number
  module: string
  duration_min: number
  notes: string | null
  created_at: string
}

export interface ProgressResponse {
  current_module: ModuleInfo | null
  programme_start: string
  programme_end: string
  programme_days_total: number
  programme_days_elapsed: number
  programme_percent: number
  recent_sessions: StudySession[]
  all_modules: ModuleInfo[]
}

export interface StudySessionCreate {
  module: string
  duration_min: number
  notes?: string
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

export interface CardWithReview {
  id: number
  topic: string
  question: string
  answer: string
  tags: string[] | null
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review: string
  last_result: string | null
}

export interface AnswerSubmit {
  card_id: number
  quality: 1 | 3 | 5
}

export interface AnswerResult {
  card_id: number
  new_interval: number
  new_ease_factor: number
  next_review: string
  result: string
}

export interface TopicStats {
  topic: string
  total_cards: number
  due_today: number
  avg_ease: number
  avg_interval: number
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatMessageCreate {
  session_id: string
  content: string
}

// ── Labs ─────────────────────────────────────────────────────────────────────

export interface Lab {
  id: number
  cml_lab_id: string | null
  topic: string
  fault_count: number
  seed: number | null
  status: 'booting' | 'ready' | 'error'
  fault_descriptions: string[] | null
  cml_url: string | null
  created_at: string
}

export interface LabCreate {
  topic: string
  fault_count: number
  seed?: number
}

export interface LabAnswerKey {
  lab_id: number
  topic: string
  fault_descriptions: string[]
}

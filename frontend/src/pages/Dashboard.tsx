import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import CurrentModuleCard from '../components/CurrentModuleCard'
import ScheduleTimeline from '../components/ScheduleTimeline'
import { BrainCircuit, MessageSquare, FlaskConical, Loader2, Clock } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.progress.get(),
  })

  const { data: quizStats } = useQuery({
    queryKey: ['quiz-topics'],
    queryFn: () => api.quiz.getTopics(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin" style={{ color: '#1C69D4' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center font-mono">
          <p style={{ color: '#EF4444' }} className="font-medium">
            [ERROR] Failed to load progress
          </p>
          <p className="text-[#71717A] text-sm mt-1">Is the backend running?</p>
        </div>
      </div>
    )
  }

  const totalDue = quizStats?.reduce((sum, t) => sum + t.due_today, 0) ?? 0

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-mono flex items-center gap-2"
          style={{ color: '#1C69D4' }}
        >
          <img src="/favicon.svg" alt="seal" className="w-7 h-7" />
          // DASHBOARD
        </h1>
        <p className="text-[#71717A] text-sm mt-0.5 font-mono">
          &gt;{' '}
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Current module */}
      {progress?.current_module ? (
        <CurrentModuleCard module={progress.current_module} />
      ) : (
        <div
          className="rounded-xl p-6 text-[#71717A] text-sm font-mono"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          No active module — programme may not have started yet.
        </div>
      )}

      {/* Overall progress */}
      <div
        className="rounded-xl p-5"
        style={{
          background: '#111113',
          border: '1px solid rgba(28,105,212,0.25)',
          boxShadow: '0 0 15px rgba(28,105,212,0.06)',
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3
            className="text-sm font-mono"
            style={{ color: '#1C69D4' }}
          >
            // PROGRAMME_PROGRESS
          </h3>
          <span
            className="font-mono font-bold"
            style={{ color: '#1C69D4' }}
          >
            [{progress?.programme_percent ?? 0}%]
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#18181b' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress?.programme_percent ?? 0}%`,
              background: 'linear-gradient(90deg, #1C69D4, #4A90D9)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#71717A] mt-2 font-mono">
          <span>
            Day {progress?.programme_days_elapsed} of {progress?.programme_days_total}
          </span>
          <span>
            {progress?.programme_start
              ? new Date(progress.programme_start).toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
            {' → '}
            {progress?.programme_end
              ? new Date(progress.programme_end).toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/quiz')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(28,105,212,0.08)',
              border: '1px solid rgba(28,105,212,0.25)',
            }}
          >
            <BrainCircuit size={20} style={{ color: '#1C69D4' }} />
          </div>
          <p className="font-mono font-semibold text-[#F4F4F5] text-sm">Flashcards</p>
          {totalDue > 0 ? (
            <p className="font-mono text-xs mt-0.5" style={{ color: '#1C69D4' }}>
              [{totalDue} cards due]
            </p>
          ) : (
            <p className="text-[#71717A] text-xs mt-0.5 font-mono">[All caught up]</p>
          )}
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(148,163,184,0.08)',
              border: '1px solid rgba(148,163,184,0.25)',
            }}
          >
            <MessageSquare size={20} style={{ color: '#94A3B8' }} />
          </div>
          <p className="font-mono font-semibold text-[#F4F4F5] text-sm">Ask Mentor</p>
          <p className="text-[#71717A] text-xs mt-0.5 font-mono">CCIE EI mentor</p>
        </button>

        <button
          onClick={() => navigate('/labs')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <FlaskConical size={20} style={{ color: '#22C55E' }} />
          </div>
          <p className="font-mono font-semibold text-[#F4F4F5] text-sm">Labs</p>
          <p className="text-[#71717A] text-xs mt-0.5 font-mono">CML topology builder</p>
        </button>
      </div>

      {/* Quiz topic stats */}
      {quizStats && quizStats.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
            boxShadow: '0 0 15px rgba(28,105,212,0.06)',
          }}
        >
          <h3
            className="text-sm font-mono mb-4"
            style={{ color: '#1C69D4' }}
          >
            // FLASHCARD_TOPICS
          </h3>
          <div className="space-y-3">
            {quizStats.map((stat) => (
              <div
                key={stat.topic}
                className="flex items-center justify-between cursor-pointer rounded px-2 py-1.5 transition-all font-mono"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                onClick={() => navigate(`/quiz/${encodeURIComponent(stat.topic)}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(28,105,212,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#F4F4F5]">{stat.topic}</span>
                  <span className="text-xs text-[#71717A]">{stat.total_cards} cards</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {stat.due_today > 0 ? (
                    <span style={{ color: '#EAB308' }} className="font-medium">
                      {stat.due_today} due
                    </span>
                  ) : (
                    <span style={{ color: '#22C55E' }}>Up to date</span>
                  )}
                  <span className="text-[#71717A]">EF: {stat.avg_ease.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {progress?.recent_sessions && progress.recent_sessions.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
            boxShadow: '0 0 15px rgba(28,105,212,0.06)',
          }}
        >
          <h3
            className="text-sm font-mono mb-4"
            style={{ color: '#1C69D4' }}
          >
            // RECENT_SESSIONS
          </h3>
          <div className="space-y-2">
            {progress.recent_sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between text-sm py-2 font-mono"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{
                      background: '#18181b',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Clock size={12} style={{ color: '#71717A' }} />
                  </div>
                  <span className="text-[#F4F4F5] font-medium">{session.module}</span>
                  {session.notes && (
                    <span className="text-[#71717A] text-xs truncate max-w-48">
                      {session.notes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ color: '#1C69D4' }}>{session.duration_min}m</span>
                  <span className="text-[#71717A] text-xs">
                    {new Date(session.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {progress?.all_modules && (
        <ScheduleTimeline modules={progress.all_modules} />
      )}
    </div>
  )
}

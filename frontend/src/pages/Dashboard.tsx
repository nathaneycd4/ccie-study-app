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
        <Loader2 size={32} className="animate-spin" style={{ color: '#00ffff' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center font-mono">
          <p style={{ color: '#ff0040' }} className="font-medium">
            [ERROR] Failed to load progress
          </p>
          <p className="text-[#64748b] text-sm mt-1">Is the backend running?</p>
        </div>
      </div>
    )
  }

  const totalDue = quizStats?.reduce((sum, t) => sum + t.due_today, 0) ?? 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-mono"
          style={{ color: '#00ffff', textShadow: '0 0 12px rgba(0,255,255,0.5)' }}
        >
          // DASHBOARD
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5 font-mono">
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
          className="rounded-xl p-6 text-[#64748b] text-sm font-mono"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.15)',
          }}
        >
          No active module — programme may not have started yet.
        </div>
      )}

      {/* Overall progress */}
      <div
        className="rounded-xl p-5"
        style={{
          background: '#0d1117',
          border: '1px solid rgba(0,255,255,0.2)',
          boxShadow: '0 0 15px rgba(0,255,255,0.04)',
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3
            className="text-sm font-mono"
            style={{ color: '#00ffff' }}
          >
            // PROGRAMME_PROGRESS
          </h3>
          <span
            className="font-mono font-bold"
            style={{ color: '#00ffff', textShadow: '0 0 8px rgba(0,255,255,0.6)' }}
          >
            [{progress?.programme_percent ?? 0}%]
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#161b22' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress?.programme_percent ?? 0}%`,
              background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
              boxShadow: '0 0 10px rgba(0,255,255,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#64748b] mt-2 font-mono">
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
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/quiz')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(0,255,255,0.06)',
              border: '1px solid rgba(0,255,255,0.2)',
            }}
          >
            <BrainCircuit size={20} style={{ color: '#00ffff' }} />
          </div>
          <p className="font-mono font-semibold text-[#e2e8f0] text-sm">Flashcards</p>
          {totalDue > 0 ? (
            <p className="font-mono text-xs mt-0.5" style={{ color: '#00ffff' }}>
              [{totalDue} cards due]
            </p>
          ) : (
            <p className="text-[#64748b] text-xs mt-0.5 font-mono">[All caught up]</p>
          )}
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(255,0,255,0.06)',
              border: '1px solid rgba(255,0,255,0.2)',
            }}
          >
            <MessageSquare size={20} style={{ color: '#ff00ff' }} />
          </div>
          <p className="font-mono font-semibold text-[#e2e8f0] text-sm">Ask Claude</p>
          <p className="text-[#64748b] text-xs mt-0.5 font-mono">CCIE EI mentor</p>
        </button>

        <button
          onClick={() => navigate('/labs')}
          className="card-cyber rounded-xl p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-all"
            style={{
              background: 'rgba(0,255,65,0.06)',
              border: '1px solid rgba(0,255,65,0.2)',
            }}
          >
            <FlaskConical size={20} style={{ color: '#00ff41' }} />
          </div>
          <p className="font-mono font-semibold text-[#e2e8f0] text-sm">Labs</p>
          <p className="text-[#64748b] text-xs mt-0.5 font-mono">CML topology builder</p>
        </button>
      </div>

      {/* Quiz topic stats */}
      {quizStats && quizStats.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
            boxShadow: '0 0 15px rgba(0,255,255,0.04)',
          }}
        >
          <h3
            className="text-sm font-mono mb-4"
            style={{ color: '#00ffff' }}
          >
            // FLASHCARD_TOPICS
          </h3>
          <div className="space-y-3">
            {quizStats.map((stat) => (
              <div
                key={stat.topic}
                className="flex items-center justify-between cursor-pointer rounded px-2 py-1.5 transition-all font-mono"
                style={{ borderBottom: '1px solid rgba(0,255,255,0.08)' }}
                onClick={() => navigate(`/quiz/${encodeURIComponent(stat.topic)}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#e2e8f0]">{stat.topic}</span>
                  <span className="text-xs text-[#64748b]">{stat.total_cards} cards</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {stat.due_today > 0 ? (
                    <span style={{ color: '#ffff00' }} className="font-medium">
                      {stat.due_today} due
                    </span>
                  ) : (
                    <span style={{ color: '#00ff41' }}>Up to date</span>
                  )}
                  <span className="text-[#64748b]">EF: {stat.avg_ease.toFixed(1)}</span>
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
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
            boxShadow: '0 0 15px rgba(0,255,255,0.04)',
          }}
        >
          <h3
            className="text-sm font-mono mb-4"
            style={{ color: '#00ffff' }}
          >
            // RECENT_SESSIONS
          </h3>
          <div className="space-y-2">
            {progress.recent_sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between text-sm py-2 font-mono"
                style={{ borderBottom: '1px solid rgba(0,255,255,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{
                      background: '#161b22',
                      border: '1px solid rgba(0,255,255,0.15)',
                    }}
                  >
                    <Clock size={12} style={{ color: '#64748b' }} />
                  </div>
                  <span className="text-[#e2e8f0] font-medium">{session.module}</span>
                  {session.notes && (
                    <span className="text-[#64748b] text-xs truncate max-w-48">
                      {session.notes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ color: '#00ffff' }}>{session.duration_min}m</span>
                  <span className="text-[#64748b] text-xs">
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

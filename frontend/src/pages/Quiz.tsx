import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { BrainCircuit, ChevronRight, Loader2, TrendingUp } from 'lucide-react'

const TOPIC_COLORS: Record<string, { border: string; glow: string; text: string }> = {
  OSPF: { border: 'rgba(28,105,212,0.35)', glow: 'rgba(28,105,212,0.08)', text: '#1C69D4' },
  BGP: { border: 'rgba(74,144,217,0.35)', glow: 'rgba(74,144,217,0.08)', text: '#4A90D9' },
  EIGRP: { border: 'rgba(14,79,168,0.35)', glow: 'rgba(14,79,168,0.08)', text: '#0E4FA8' },
}

const DEFAULT_TOPIC_STYLE = {
  border: 'rgba(28,105,212,0.2)',
  glow: 'rgba(28,105,212,0.04)',
  text: '#71717A',
}

export default function Quiz() {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
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

  if (!stats || stats.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1
          className="text-2xl font-mono mb-2"
          style={{ color: '#1C69D4' }}
        >
          // FLASHCARDS
        </h1>
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          <BrainCircuit
            size={40}
            className="mx-auto mb-3"
            style={{ color: 'rgba(28,105,212,0.3)' }}
          />
          <p className="text-[#71717A] font-mono font-medium">No cards yet</p>
          <p className="text-[#71717A] opacity-60 text-sm mt-1 font-mono">
            Run{' '}
            <code
              className="font-mono px-1.5 py-0.5 rounded"
              style={{
                background: '#18181b',
                border: '1px solid rgba(28,105,212,0.2)',
                color: '#22C55E',
              }}
            >
              python seed_quiz_data.py
            </code>{' '}
            to seed the database
          </p>
        </div>
      </div>
    )
  }

  const totalCards = stats.reduce((s, t) => s + t.total_cards, 0)
  const totalDue = stats.reduce((s, t) => s + t.due_today, 0)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-mono"
          style={{ color: '#1C69D4' }}
        >
          // FLASHCARDS
        </h1>
        <p className="text-[#71717A] text-sm mt-0.5 font-mono">
          &gt; {totalCards} cards • {totalDue} due today
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          <p className="text-xs text-[#71717A] mb-1 font-mono">Total Cards</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{ color: '#F4F4F5' }}
          >
            {totalCards}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: '#111113',
            border: `1px solid ${totalDue > 0 ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
          }}
        >
          <p className="text-xs text-[#71717A] mb-1 font-mono">Due Today</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{
              color: totalDue > 0 ? '#EAB308' : '#22C55E',
            }}
          >
            {totalDue}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          <p className="text-xs text-[#71717A] mb-1 font-mono">Topics</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{ color: '#F4F4F5' }}
          >
            {stats.length}
          </p>
        </div>
      </div>

      {/* Topic cards */}
      <div className="space-y-3">
        {stats.map((stat) => {
          const style = TOPIC_COLORS[stat.topic] ?? DEFAULT_TOPIC_STYLE

          return (
            <button
              key={stat.topic}
              onClick={() => navigate(`/quiz/${encodeURIComponent(stat.topic)}`)}
              className="w-full rounded-xl p-5 text-left transition-all hover:scale-[1.01] font-mono"
              style={{
                background: `linear-gradient(135deg, ${style.glow} 0%, rgba(0,0,0,0) 100%)`,
                border: `1px solid ${style.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${style.glow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3
                      className="text-lg font-mono font-bold"
                      style={{ color: style.text }}
                    >
                      {stat.topic}
                    </h3>
                    <p className="text-[#71717A] text-sm">{stat.total_cards} cards</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Stats */}
                  <div className="text-right">
                    {stat.due_today > 0 ? (
                      <p
                        className="font-mono font-semibold"
                        style={{ color: '#EAB308' }}
                      >
                        {stat.due_today} due
                      </p>
                    ) : (
                      <p
                        className="font-mono font-semibold"
                        style={{ color: '#22C55E' }}
                      >
                        All caught up
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-[#71717A] mt-0.5 justify-end">
                      <TrendingUp size={11} />
                      <span>
                        EF {stat.avg_ease.toFixed(2)} • {stat.avg_interval.toFixed(0)}d avg
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: '#71717A' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

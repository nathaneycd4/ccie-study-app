import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { BrainCircuit, ChevronRight, Loader2, TrendingUp } from 'lucide-react'

const TOPIC_COLORS: Record<string, { border: string; glow: string; text: string }> = {
  OSPF: { border: 'rgba(0,255,255,0.35)', glow: 'rgba(0,255,255,0.08)', text: '#00ffff' },
  BGP: { border: 'rgba(255,0,255,0.35)', glow: 'rgba(255,0,255,0.08)', text: '#ff00ff' },
  EIGRP: { border: 'rgba(255,255,0,0.35)', glow: 'rgba(255,255,0,0.08)', text: '#ffff00' },
}

const DEFAULT_TOPIC_STYLE = {
  border: 'rgba(0,255,255,0.2)',
  glow: 'rgba(0,255,255,0.04)',
  text: '#64748b',
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
        <Loader2 size={32} className="animate-spin" style={{ color: '#00ffff' }} />
      </div>
    )
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1
          className="text-2xl font-mono mb-2"
          style={{ color: '#00ffff', textShadow: '0 0 12px rgba(0,255,255,0.5)' }}
        >
          // FLASHCARDS
        </h1>
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
          }}
        >
          <BrainCircuit
            size={40}
            className="mx-auto mb-3"
            style={{ color: 'rgba(0,255,255,0.2)' }}
          />
          <p className="text-[#64748b] font-mono font-medium">No cards yet</p>
          <p className="text-[#64748b] opacity-60 text-sm mt-1 font-mono">
            Run{' '}
            <code
              className="font-mono px-1.5 py-0.5 rounded"
              style={{
                background: '#161b22',
                border: '1px solid rgba(0,255,255,0.2)',
                color: '#00ff41',
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
          style={{ color: '#00ffff', textShadow: '0 0 12px rgba(0,255,255,0.5)' }}
        >
          // FLASHCARDS
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5 font-mono">
          &gt; {totalCards} cards • {totalDue} due today
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
          }}
        >
          <p className="text-xs text-[#64748b] mb-1 font-mono">Total Cards</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{ color: '#e2e8f0' }}
          >
            {totalCards}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: '#0d1117',
            border: `1px solid ${totalDue > 0 ? 'rgba(255,255,0,0.3)' : 'rgba(0,255,65,0.3)'}`,
          }}
        >
          <p className="text-xs text-[#64748b] mb-1 font-mono">Due Today</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{
              color: totalDue > 0 ? '#ffff00' : '#00ff41',
              textShadow: totalDue > 0
                ? '0 0 8px rgba(255,255,0,0.5)'
                : '0 0 8px rgba(0,255,65,0.5)',
            }}
          >
            {totalDue}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
          }}
        >
          <p className="text-xs text-[#64748b] mb-1 font-mono">Topics</p>
          <p
            className="text-2xl font-mono font-bold"
            style={{ color: '#e2e8f0' }}
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
                      style={{ color: style.text, textShadow: `0 0 8px ${style.text}80` }}
                    >
                      {stat.topic}
                    </h3>
                    <p className="text-[#64748b] text-sm">{stat.total_cards} cards</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Stats */}
                  <div className="text-right">
                    {stat.due_today > 0 ? (
                      <p
                        className="font-mono font-semibold"
                        style={{ color: '#ffff00' }}
                      >
                        {stat.due_today} due
                      </p>
                    ) : (
                      <p
                        className="font-mono font-semibold"
                        style={{ color: '#00ff41' }}
                      >
                        All caught up
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5 justify-end">
                      <TrendingUp size={11} />
                      <span>
                        EF {stat.avg_ease.toFixed(2)} • {stat.avg_interval.toFixed(0)}d avg
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: '#64748b' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import FlashcardViewer from '../components/FlashcardViewer'
import { ArrowLeft, Trophy, RotateCcw, Loader2 } from 'lucide-react'

export default function FlashcardSession() {
  const { topic } = useParams<{ topic: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cardIndex, setCardIndex] = useState(0)
  const [results, setResults] = useState<{ quality: number }[]>([])
  const [sessionDone, setSessionDone] = useState(false)

  const { data: cards, isLoading } = useQuery({
    queryKey: ['deck', topic],
    queryFn: () => api.quiz.getDeck(topic!),
    enabled: !!topic,
  })

  const answerMutation = useMutation({
    mutationFn: api.quiz.submitAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-topics'] })
    },
  })

  const handleAnswer = async (quality: 1 | 3 | 5) => {
    if (!cards) return
    const card = cards[cardIndex]

    setResults((r) => [...r, { quality }])
    await answerMutation.mutateAsync({ card_id: card.id, quality })

    if (cardIndex + 1 >= cards.length) {
      setSessionDone(true)
    } else {
      setCardIndex((i) => i + 1)
    }
  }

  const handleRestart = () => {
    setCardIndex(0)
    setResults([])
    setSessionDone(false)
    queryClient.invalidateQueries({ queryKey: ['deck', topic] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin" style={{ color: '#00ffff' }} />
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-2 text-sm mb-6 transition-colors font-mono"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={15} />
          &lt; Back to topics
        </button>
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,255,0.2)',
          }}
        >
          <Trophy size={40} className="mx-auto mb-3" style={{ color: '#00ff41' }} />
          <p
            className="font-mono font-semibold text-lg"
            style={{ color: '#00ff41', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
          >
            [ALL CAUGHT UP]
          </p>
          <p className="text-[#64748b] text-sm mt-1 font-mono">
            No cards due for {topic}. Check back tomorrow.
          </p>
        </div>
      </div>
    )
  }

  if (sessionDone) {
    const correct = results.filter((r) => r.quality === 5).length
    const almost = results.filter((r) => r.quality === 3).length
    const missed = results.filter((r) => r.quality === 1).length

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-2 text-sm mb-6 transition-colors font-mono"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={15} />
          &lt; Back to topics
        </button>

        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(0,255,65,0.3)',
            boxShadow: '0 0 20px rgba(0,255,65,0.07)',
          }}
        >
          <div
            className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(0,255,65,0.08)',
              border: '1px solid rgba(0,255,65,0.3)',
              boxShadow: '0 0 20px rgba(0,255,65,0.15)',
            }}
          >
            <Trophy size={32} style={{ color: '#00ff41' }} />
          </div>
          <h2
            className="text-xl font-mono mb-1"
            style={{ color: '#00ff41', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
          >
            [SESSION_COMPLETE]
          </h2>
          <p className="text-[#64748b] text-sm mb-6 font-mono">
            {topic} • {results.length} cards reviewed
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(0,255,65,0.05)',
                border: '1px solid rgba(0,255,65,0.2)',
              }}
            >
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}
              >
                {correct}
              </p>
              <p className="text-xs text-[#64748b] mt-1 font-mono">Correct</p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,0,0.05)',
                border: '1px solid rgba(255,255,0,0.2)',
              }}
            >
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: '#ffff00', textShadow: '0 0 8px rgba(255,255,0,0.5)' }}
              >
                {almost}
              </p>
              <p className="text-xs text-[#64748b] mt-1 font-mono">Almost</p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,0,64,0.05)',
                border: '1px solid rgba(255,0,64,0.2)',
              }}
            >
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: '#ff0040', textShadow: '0 0 8px rgba(255,0,64,0.5)' }}
              >
                {missed}
              </p>
              <p className="text-xs text-[#64748b] mt-1 font-mono">Missed</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="btn-cyber flex items-center gap-2 px-4 py-2 rounded font-mono text-sm"
            >
              <RotateCcw size={14} />
              [ Study again ]
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="btn-cyber btn-cyber-green px-4 py-2 rounded font-mono text-sm font-semibold"
            >
              [ Done ]
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-2 text-sm transition-colors font-mono"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={15} />
          &lt; Back
        </button>
        <h2
          className="text-sm font-mono"
          style={{ color: '#00ffff' }}
        >
          {topic} // FLASHCARDS
        </h2>
        <div />
      </div>

      <FlashcardViewer
        card={cards[cardIndex]}
        cardIndex={cardIndex}
        totalCards={cards.length}
        onAnswer={handleAnswer}
      />
    </div>
  )
}

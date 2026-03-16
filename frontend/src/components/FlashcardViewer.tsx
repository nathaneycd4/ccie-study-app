import { useState } from 'react'
import type { CardWithReview } from '../types'
import { RotateCcw } from 'lucide-react'

interface Props {
  card: CardWithReview
  cardIndex: number
  totalCards: number
  onAnswer: (quality: 1 | 3 | 5) => void
  onNext: () => void
  onPrevious: () => void
  hasPrevious: boolean
}

export default function FlashcardViewer({ card, cardIndex, totalCards, onAnswer, onNext, onPrevious, hasPrevious }: Props) {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => setFlipped((f) => !f)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between text-sm font-mono mb-2" style={{ color: '#71717A' }}>
          <span>Card {cardIndex + 1} of {totalCards}</span>
          <span style={{ color: '#1C69D4' }}>{card.topic}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#18181b' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((cardIndex) / totalCards) * 100}%`,
              background: 'linear-gradient(90deg, #1C69D4, #4A90D9)',
            }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-2xl cursor-pointer"
        style={{ perspective: '1200px', height: '320px' }}
        onClick={handleFlip}
      >
        <div className={`card-3d w-full h-full relative ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div
            className="card-face absolute inset-0 rounded-2xl p-8 flex flex-col justify-between"
            style={{
              background: '#111113',
              border: '1px solid rgba(28,105,212,0.25)',
              boxShadow: '0 0 20px rgba(28,105,212,0.06)',
            }}
          >
            <div className="flex items-start justify-between">
              <span
                className="text-xs font-mono uppercase tracking-wider px-2 py-1 rounded"
                style={{
                  background: 'rgba(28,105,212,0.08)',
                  border: '1px solid rgba(28,105,212,0.2)',
                  color: '#1C69D4',
                }}
              >
                // QUESTION
              </span>
              <div className="text-xs text-[#71717A] flex items-center gap-1 font-mono">
                <RotateCcw size={12} />
                tap to reveal
              </div>
            </div>
            <p
              className="text-xl font-mono leading-relaxed text-center px-4"
              style={{ color: '#1C69D4' }}
            >
              {card.question}
            </p>
            <div className="flex gap-2">
              {card.tags?.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(28,105,212,0.06)',
                    border: '1px solid rgba(28,105,212,0.15)',
                    color: '#71717A',
                  }}
                >
                  [{t}]
                </span>
              ))}
            </div>
          </div>

          {/* Back */}
          <div
            className="card-face card-back absolute inset-0 rounded-2xl p-8 flex flex-col gap-4"
            style={{
              background: '#111113',
              border: '1px solid rgba(34,197,94,0.35)',
              boxShadow: '0 0 20px rgba(34,197,94,0.08)',
            }}
          >
            <span
              className="text-xs font-mono uppercase tracking-wider px-2 py-1 rounded w-fit"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: '#22C55E',
              }}
            >
              // ANSWER
            </span>
            <div className="flex-1 overflow-y-auto">
              <pre
                className="font-mono text-sm whitespace-pre-wrap leading-relaxed"
                style={{ color: '#22C55E' }}
              >
                {card.answer}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Answer buttons — only show when flipped */}
      {flipped && (
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onAnswer(1)}
              className="btn-cyber btn-cyber-red flex flex-col items-center gap-1 py-3 px-4 rounded-xl"
            >
              <span className="text-lg font-bold">1</span>
              <span className="text-xs">Missed</span>
            </button>
            <button
              onClick={() => onAnswer(3)}
              className="btn-cyber btn-cyber-yellow flex flex-col items-center gap-1 py-3 px-4 rounded-xl"
            >
              <span className="text-lg font-bold">3</span>
              <span className="text-xs">Almost</span>
            </button>
            <button
              onClick={() => onAnswer(5)}
              className="btn-cyber btn-cyber-green flex flex-col items-center gap-1 py-3 px-4 rounded-xl"
            >
              <span className="text-lg font-bold">5</span>
              <span className="text-xs">Got it</span>
            </button>
          </div>
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="text-xs font-mono px-3 py-1.5 rounded transition-colors w-fit"
              style={{ color: '#71717A', border: '1px solid rgba(113,113,122,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F4F4F5'; e.currentTarget.style.borderColor = 'rgba(244,244,245,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.borderColor = 'rgba(113,113,122,0.3)' }}
            >
              ← Previous
            </button>
          )}
        </div>
      )}

      {!flipped && (
        <div className="w-full max-w-2xl flex items-center justify-between">
          {hasPrevious ? (
            <button
              onClick={onPrevious}
              className="text-xs font-mono px-3 py-1.5 rounded transition-colors"
              style={{ color: '#71717A', border: '1px solid rgba(113,113,122,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F4F4F5'; e.currentTarget.style.borderColor = 'rgba(244,244,245,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.borderColor = 'rgba(113,113,122,0.3)' }}
            >
              ← Previous
            </button>
          ) : (
            <p className="text-[#71717A] text-sm font-mono">
              &gt; Click the card to reveal the answer
            </p>
          )}
          <button
            onClick={onNext}
            className="text-xs font-mono px-3 py-1.5 rounded transition-colors"
            style={{ color: '#71717A', border: '1px solid rgba(113,113,122,0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F4F4F5'; e.currentTarget.style.borderColor = 'rgba(244,244,245,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.borderColor = 'rgba(113,113,122,0.3)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

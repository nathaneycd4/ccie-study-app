import { useState } from 'react'
import type { Lab } from '../types'
import { api } from '../api/client'
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import LabTopology from './LabTopology'

interface Props {
  lab: Lab
  onDelete: (id: number) => void
}

const STATUS_ICON = {
  booting: <Loader2 size={16} className="animate-spin" style={{ color: '#EAB308' }} />,
  ready: <CheckCircle2 size={16} style={{ color: '#22C55E' }} />,
  error: <XCircle size={16} style={{ color: '#EF4444' }} />,
}

const STATUS_COLOR = {
  booting: '#EAB308',
  ready: '#22C55E',
  error: '#EF4444',
}

export default function LabStatusCard({ lab, onDelete }: Props) {
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [answerKey, setAnswerKey] = useState<string[] | null>(null)
  const [loadingKey, setLoadingKey] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState<boolean[]>([])

  const toggleChecked = (i: number) => {
    setChecked((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const handleReveal = async () => {
    if (answerKey) {
      setAnswerRevealed((r) => !r)
      return
    }
    setLoadingKey(true)
    try {
      const key = await api.labs.getAnswerKey(lab.id)
      setAnswerKey(key.fault_descriptions)
      setChecked(new Array(key.fault_descriptions.length).fill(false))
      setAnswerRevealed(true)
    } catch {
      // use embedded fault_descriptions if available
      if (lab.fault_descriptions) {
        setAnswerKey(lab.fault_descriptions)
        setChecked(new Array(lab.fault_descriptions.length).fill(false))
        setAnswerRevealed(true)
      }
    } finally {
      setLoadingKey(false)
    }
  }

  const createdAt = new Date(lab.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusColor = STATUS_COLOR[lab.status as keyof typeof STATUS_COLOR] ?? '#71717A'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#111113',
        border: '1px solid rgba(28,105,212,0.25)',
        boxShadow: '0 0 15px rgba(28,105,212,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {STATUS_ICON[lab.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.booting}
            <span
              className="text-sm font-mono capitalize"
              style={{
                color: statusColor,
              }}
            >
              {lab.status === 'booting' ? 'BOOTING...' : lab.status.toUpperCase()}
            </span>
          </div>
          <span style={{ color: '#71717A' }}>•</span>
          <span className="text-sm font-mono font-semibold text-[#F4F4F5]">
            {lab.topic.toUpperCase()}
          </span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(28,105,212,0.06)',
              border: '1px solid rgba(28,105,212,0.15)',
              color: '#71717A',
            }}
          >
            {lab.fault_count} {lab.fault_count === 1 ? 'fault' : 'faults'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717A] font-mono">{createdAt}</span>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[#71717A] hover:text-[#F4F4F5] transition-colors p-1"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 py-3 space-y-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Topology diagram */}
          <LabTopology lab={lab} />

          {/* CML URL */}
          {lab.cml_url && lab.status === 'ready' && (
            <a
              href={lab.cml_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-mono transition-colors"
              style={{ color: '#1C69D4' }}
            >
              <ExternalLink size={14} />
              Open in CML: {lab.cml_url}
            </a>
          )}

          {/* Answer key */}
          {lab.status === 'ready' && (
            <div>
              <button
                onClick={handleReveal}
                disabled={loadingKey}
                className="btn-cyber btn-cyber-magenta flex items-center gap-2 text-xs font-mono rounded px-3 py-1.5"
              >
                {loadingKey ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : answerRevealed ? (
                  <EyeOff size={13} />
                ) : (
                  <Eye size={13} />
                )}
                {answerRevealed ? '[ HIDE FAULTS ]' : '[ REVEAL FAULTS ]'}
              </button>

              {answerRevealed && answerKey && (
                <div className="mt-2 space-y-1.5">
                  {/* Progress */}
                  <div className="flex items-center gap-3 text-xs font-mono mb-2">
                    {checked.filter(Boolean).length === answerKey.length ? (
                      <>
                        <img src="/favicon.svg" alt="seal" className="w-8 h-8 seal-tada" />
                        <span style={{ color: '#22C55E' }}>✓ All faults fixed!</span>
                      </>
                    ) : (
                      <span style={{ color: '#71717A' }}>
                        {checked.filter(Boolean).length} / {answerKey.length} fixed
                      </span>
                    )}
                  </div>
                  {answerKey.map((fault, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all"
                      style={{
                        background: checked[i] ? 'rgba(34,197,94,0.05)' : '#09090b',
                        border: `1px solid ${checked[i] ? 'rgba(34,197,94,0.3)' : 'rgba(28,105,212,0.15)'}`,
                      }}
                      onClick={() => toggleChecked(i)}
                    >
                      <div
                        className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
                        style={{
                          background: checked[i] ? 'rgba(34,197,94,0.2)' : 'transparent',
                          border: `1px solid ${checked[i] ? '#22C55E' : 'rgba(113,113,122,0.5)'}`,
                        }}
                      >
                        {checked[i] && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className="font-bold text-xs font-mono"
                          style={{ color: checked[i] ? '#22C55E' : '#94A3B8' }}
                        >
                          F{i + 1}{' '}
                        </span>
                        <span
                          className="text-sm font-mono"
                          style={{
                            color: checked[i] ? '#71717A' : '#F4F4F5',
                            textDecoration: checked[i] ? 'line-through' : 'none',
                          }}
                        >
                          {fault}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(lab.id)}
            className="flex items-center gap-1.5 text-xs font-mono transition-colors"
            style={{ color: 'rgba(239,68,68,0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.6)')}
          >
            <Trash2 size={13} />
            Delete lab
          </button>
        </div>
      )}
    </div>
  )
}

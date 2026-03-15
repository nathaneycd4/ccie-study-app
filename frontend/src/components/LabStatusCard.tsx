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
  booting: <Loader2 size={16} className="animate-spin" style={{ color: '#ffff00' }} />,
  ready: <CheckCircle2 size={16} style={{ color: '#00ff41' }} />,
  error: <XCircle size={16} style={{ color: '#ff0040' }} />,
}

const STATUS_COLOR = {
  booting: '#ffff00',
  ready: '#00ff41',
  error: '#ff0040',
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

  const statusColor = STATUS_COLOR[lab.status as keyof typeof STATUS_COLOR] ?? '#64748b'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(0,255,255,0.2)',
        boxShadow: '0 0 15px rgba(0,255,255,0.04)',
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
                textShadow: `0 0 8px ${statusColor}80`,
              }}
            >
              {lab.status === 'booting' ? 'BOOTING...' : lab.status.toUpperCase()}
            </span>
          </div>
          <span style={{ color: '#64748b' }}>•</span>
          <span className="text-sm font-mono font-semibold text-[#e2e8f0]">
            {lab.topic.toUpperCase()}
          </span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,255,255,0.06)',
              border: '1px solid rgba(0,255,255,0.15)',
              color: '#64748b',
            }}
          >
            {lab.fault_count} {lab.fault_count === 1 ? 'fault' : 'faults'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b] font-mono">{createdAt}</span>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[#64748b] hover:text-[#e2e8f0] transition-colors p-1"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 py-3 space-y-3"
          style={{ borderTop: '1px solid rgba(0,255,255,0.12)' }}
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
              style={{ color: '#00ffff' }}
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
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span style={{ color: checked.filter(Boolean).length === answerKey.length ? '#00ff41' : '#64748b' }}>
                      {checked.filter(Boolean).length === answerKey.length
                        ? '✓ All faults fixed!'
                        : `${checked.filter(Boolean).length} / ${answerKey.length} fixed`}
                    </span>
                  </div>
                  {answerKey.map((fault, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all"
                      style={{
                        background: checked[i] ? 'rgba(0,255,65,0.05)' : '#0a0a0f',
                        border: `1px solid ${checked[i] ? 'rgba(0,255,65,0.3)' : 'rgba(0,255,255,0.15)'}`,
                      }}
                      onClick={() => toggleChecked(i)}
                    >
                      <div
                        className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
                        style={{
                          background: checked[i] ? 'rgba(0,255,65,0.2)' : 'transparent',
                          border: `1px solid ${checked[i] ? '#00ff41' : 'rgba(100,116,139,0.5)'}`,
                        }}
                      >
                        {checked[i] && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#00ff41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className="font-bold text-xs font-mono"
                          style={{ color: checked[i] ? '#00ff41' : '#ff00ff', textShadow: checked[i] ? '0 0 6px rgba(0,255,65,0.5)' : '0 0 6px rgba(255,0,255,0.5)' }}
                        >
                          F{i + 1}{' '}
                        </span>
                        <span
                          className="text-sm font-mono"
                          style={{
                            color: checked[i] ? '#64748b' : '#e2e8f0',
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
            style={{ color: 'rgba(255,0,64,0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff0040')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,0,64,0.6)')}
          >
            <Trash2 size={13} />
            Delete lab
          </button>
        </div>
      )}
    </div>
  )
}

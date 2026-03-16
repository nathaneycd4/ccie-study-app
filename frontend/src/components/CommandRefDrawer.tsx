import { X, BookOpen } from 'lucide-react'
import { COMMAND_REF } from '../data/commandRef'

interface Props {
  topic: string
  onClose: () => void
}

export default function CommandRefDrawer({ topic, onClose }: Props) {
  const groups = COMMAND_REF[topic] ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 w-full max-w-sm flex flex-col overflow-hidden"
        style={{
          background: '#111113',
          borderLeft: '1px solid rgba(28,105,212,0.3)',
          boxShadow: '-8px 0 40px rgba(28,105,212,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={15} style={{ color: '#1C69D4' }} />
            <span className="font-mono text-sm font-semibold" style={{ color: '#1C69D4' }}>
              {topic} // REF
            </span>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#71717A' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4F5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {groups.length === 0 ? (
            <p className="text-[#71717A] font-mono text-sm">
              No reference available for this topic yet.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-mono uppercase tracking-widest text-[#71717A] mb-3">
                  — {group.label}
                </p>
                <div className="space-y-2">
                  {group.commands.map(({ cmd, desc }) => (
                    <div
                      key={cmd}
                      className="rounded-lg p-3"
                      style={{
                        background: '#09090b',
                        border: '1px solid rgba(28,105,212,0.12)',
                      }}
                    >
                      <code
                        className="text-xs font-mono block mb-1"
                        style={{ color: '#22C55E' }}
                      >
                        {cmd}
                      </code>
                      <span className="text-xs font-mono" style={{ color: '#71717A' }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

import type { ModuleInfo } from '../types'
import { Calendar, Clock, TrendingUp } from 'lucide-react'

interface Props {
  module: ModuleInfo
}

export default function CurrentModuleCard({ module }: Props) {
  const progressPct = Math.round((module.day_number / module.total_days) * 100)

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(28,105,212,0.08) 0%, rgba(28,105,212,0.03) 100%)',
        border: '1px solid rgba(28,105,212,0.3)',
        boxShadow: '0 0 20px rgba(28,105,212,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-[#71717A] uppercase tracking-wider mb-1">
            // CURRENT_MODULE
          </p>
          <h2
            className="text-2xl font-mono"
            style={{ color: '#1C69D4' }}
          >
            {module.name}
          </h2>
        </div>
        <div
          className="rounded px-3 py-1.5 font-mono text-sm"
          style={{
            background: 'rgba(28,105,212,0.08)',
            border: '1px solid rgba(28,105,212,0.3)',
            color: '#1C69D4',
          }}
        >
          [WK {module.week_number}]
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#71717A] font-mono mb-1.5">
          <span>Day {module.day_number} of {module.total_days}</span>
          <span style={{ color: '#1C69D4' }}>{progressPct}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: '#18181b' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #1C69D4, #4A90D9)',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-lg p-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(28,105,212,0.12)' }}
        >
          <div className="flex items-center gap-1.5 text-[#71717A] text-xs mb-1 font-mono">
            <Clock size={12} />
            <span>Remaining</span>
          </div>
          <p className="text-[#F4F4F5] font-mono font-semibold">
            [{module.days_remaining}d]
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(28,105,212,0.12)' }}
        >
          <div className="flex items-center gap-1.5 text-[#71717A] text-xs mb-1 font-mono">
            <Calendar size={12} />
            <span>Ends</span>
          </div>
          <p className="text-[#F4F4F5] font-mono font-semibold text-sm">
            {new Date(module.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(28,105,212,0.12)' }}
        >
          <div className="flex items-center gap-1.5 text-[#71717A] text-xs mb-1 font-mono">
            <TrendingUp size={12} />
            <span>Progress</span>
          </div>
          <p className="font-mono font-semibold" style={{ color: '#1C69D4' }}>
            {progressPct}%
          </p>
        </div>
      </div>
    </div>
  )
}

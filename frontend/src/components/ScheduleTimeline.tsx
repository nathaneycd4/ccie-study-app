import type { ModuleInfo } from '../types'

interface Props {
  modules: ModuleInfo[]
}

const MODULE_COLORS: Record<string, string> = {
  'Induction/Admin': '#71717A',
  'ENARSI': '#1C69D4',
  'BGP': '#4A90D9',
  'MPLS': '#EAB308',
  'MCAST': '#0E4FA8',
  'ENSDWI': '#22C55E',
  'CCFND': '#34D399',
  'CSAU': '#22C55E',
  'ENAUTO': '#6EE7B7',
  'RECAP': '#8888aa',
  'BOOTCAMP (R&S)': '#EF4444',
  'BOOTCAMP (SDX)': '#94A3B8',
  'SIM LAB': '#DC2626',
  'EXAM': '#1C69D4',
}

function getColor(name: string): string {
  return MODULE_COLORS[name] ?? '#71717A'
}

export default function ScheduleTimeline({ modules }: Props) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: '#111113',
        border: '1px solid rgba(28,105,212,0.25)',
        boxShadow: '0 0 15px rgba(28,105,212,0.06)',
      }}
    >
      <h3
        className="text-sm font-mono mb-4 uppercase tracking-wider"
        style={{ color: '#1C69D4' }}
      >
        // PROGRAMME_TIMELINE
      </h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {modules.map((mod) => {
            const widthUnits = Math.max(2, Math.round(mod.total_days / 3))
            const color = getColor(mod.name)
            return (
              <div
                key={`${mod.name}-${mod.start_date}`}
                className="relative group"
                style={{ width: `${widthUnits * 10}px`, minWidth: '24px' }}
              >
                <div
                  className="h-8 rounded transition-all"
                  style={{
                    background: color,
                    opacity: mod.is_current ? 1 : 0.45,
                    boxShadow: mod.is_current
                      ? `0 0 8px ${color}60`
                      : 'none',
                    outline: mod.is_current ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div
                    className="rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl font-mono"
                    style={{
                      background: '#111113',
                      border: '1px solid rgba(28,105,212,0.3)',
                      boxShadow: '0 0 15px rgba(28,105,212,0.12)',
                    }}
                  >
                    <p className="font-semibold text-[#F4F4F5]">{mod.name}</p>
                    <p className="text-[#71717A]">
                      {new Date(mod.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(mod.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[#71717A]">{mod.total_days} days</p>
                    {mod.is_current && (
                      <p className="text-bmw-blue font-medium">&lt;-- YOU ARE HERE</p>
                    )}
                  </div>
                </div>

                {/* Label for wider blocks */}
                {widthUnits >= 6 && (
                  <p
                    className="text-center text-xs mt-1 truncate px-1 font-mono"
                    style={{ color: '#71717A' }}
                  >
                    {mod.name}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

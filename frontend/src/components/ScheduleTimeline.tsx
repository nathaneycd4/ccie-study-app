import type { ModuleInfo } from '../types'

interface Props {
  modules: ModuleInfo[]
}

const MODULE_COLORS: Record<string, string> = {
  'Induction/Admin': '#64748b',
  'ENARSI': '#00ffff',
  'BGP': '#ff00ff',
  'MPLS': '#ffff00',
  'MCAST': '#ff8800',
  'ENSDWI': '#00ffcc',
  'CCFND': '#00ff99',
  'CSAU': '#00ff41',
  'ENAUTO': '#88ff00',
  'RECAP': '#8888aa',
  'BOOTCAMP (R&S)': '#ff0040',
  'BOOTCAMP (SDX)': '#ff44aa',
  'SIM LAB': '#ff2266',
  'EXAM': '#00ffff',
}

function getColor(name: string): string {
  return MODULE_COLORS[name] ?? '#64748b'
}

export default function ScheduleTimeline({ modules }: Props) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(0,255,255,0.2)',
        boxShadow: '0 0 15px rgba(0,255,255,0.05)',
      }}
    >
      <h3
        className="text-sm font-mono mb-4 uppercase tracking-wider"
        style={{ color: '#00ffff', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}
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
                      ? `0 0 12px ${color}, 0 0 24px ${color}60`
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
                      background: '#0d1117',
                      border: '1px solid rgba(0,255,255,0.3)',
                      boxShadow: '0 0 15px rgba(0,255,255,0.1)',
                    }}
                  >
                    <p className="font-semibold text-[#e2e8f0]">{mod.name}</p>
                    <p className="text-[#64748b]">
                      {new Date(mod.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(mod.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[#64748b]">{mod.total_days} days</p>
                    {mod.is_current && (
                      <p className="text-neon-cyan font-medium">&lt;-- YOU ARE HERE</p>
                    )}
                  </div>
                </div>

                {/* Label for wider blocks */}
                {widthUnits >= 6 && (
                  <p
                    className="text-center text-xs mt-1 truncate px-1 font-mono"
                    style={{ color: '#64748b' }}
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

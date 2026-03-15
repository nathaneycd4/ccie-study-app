import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquare,
  Server,
} from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quiz', label: 'Flashcards', icon: BrainCircuit },
  { to: '/chat', label: 'Ask Claude', icon: MessageSquare },
  { to: '/labs', label: 'Labs', icon: Server },
]

export default function Navbar() {
  return (
    <nav
      className="w-56 flex flex-col shrink-0"
      style={{
        background: '#0a0a0f',
        borderRight: '1px solid rgba(0,255,255,0.15)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: '1px solid rgba(0,255,255,0.15)' }}
      >
        <div className="text-neon-cyan font-mono text-lg leading-none">
          Nathan Fagan
        </div>
        <div className="text-[#64748b] text-xs mt-1.5 font-mono">
          &gt; CCIE EI CANDIDATE
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-neon-cyan'
                : 'flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-[#64748b] hover:text-[#e2e8f0]'
            }
            style={({ isActive }) =>
              isActive
                ? {
                    borderLeft: '2px solid #00ffff',
                    background: 'rgba(0,255,255,0.05)',
                    paddingLeft: '10px',
                  }
                : {
                    borderLeft: '2px solid transparent',
                  }
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-neon-cyan' : 'text-[#64748b]'}>
                  &gt;
                </span>
                <Icon size={15} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: '1px solid rgba(0,255,255,0.15)' }}
      >
        <p className="text-neon-green text-xs font-mono">● SYSTEM ONLINE</p>
        <p className="text-[#64748b] text-xs mt-0.5">Exam: Jan 2027</p>
      </div>
    </nav>
  )
}

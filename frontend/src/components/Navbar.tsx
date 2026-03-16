import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquare,
  Server,
  LogOut,
} from 'lucide-react'
import { isAuthenticated, logout, getStoredEmail } from '../lib/auth'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quiz', label: 'Flashcards', icon: BrainCircuit },
  { to: '/chat', label: 'Ask Mentor', icon: MessageSquare },
  { to: '/labs', label: 'Labs', icon: Server },
]

export default function Navbar() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const email = getStoredEmail()

  const handleLogout = () => {
    logout()
    navigate('/dashboard', { replace: true })
  }

  return (
    <nav
      className="w-56 flex flex-col shrink-0"
      style={{
        background: '#09090b',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-bmw-blue font-mono text-lg leading-none">
          Nathan Fagan
        </div>
        <div className="text-[#71717A] text-xs mt-1.5 font-mono">
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
                ? 'flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-bmw-blue'
                : 'flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-[#71717A] hover:text-[#F4F4F5]'
            }
            style={({ isActive }) =>
              isActive
                ? {
                    borderLeft: '2px solid #1C69D4',
                    background: 'rgba(28,105,212,0.08)',
                    paddingLeft: '10px',
                  }
                : {
                    borderLeft: '2px solid transparent',
                  }
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-bmw-blue' : 'text-[#71717A]'}>
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
        className="px-5 py-4 flex flex-col gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div>
          <p className="text-bmw-green text-xs font-mono">● SYSTEM ONLINE</p>
          <p className="text-[#71717A] text-xs mt-0.5">Exam: Jan 2027</p>
        </div>
        {authenticated && (
          <div className="flex flex-col gap-1">
            <p className="text-[#71717A] text-xs font-mono truncate">{email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-mono transition-colors w-fit"
              style={{ color: '#71717A' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
            >
              <LogOut size={12} />
              logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

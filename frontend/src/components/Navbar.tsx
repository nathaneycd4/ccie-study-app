import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquare,
  Server,
  LogOut,
  BookOpen,
  Menu,
  X,
} from 'lucide-react'
import { isAuthenticated, logout, getStoredEmail } from '../lib/auth'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quiz', label: 'Flashcards', icon: BrainCircuit },
  { to: '/chat', label: 'Mentor', icon: MessageSquare },
  { to: '/labs', label: 'Labs', icon: Server },
  { to: '/blog', label: 'Blog', icon: BookOpen },
]

export default function Navbar() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const email = getStoredEmail()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/dashboard', { replace: true })
  }

  return (
    <nav
      className="relative w-full shrink-0 z-50"
      style={{
        background: '#09090b',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: '56px',
      }}
    >
      <div className="flex items-center h-full px-4 sm:px-6">
        {/* Left: branding */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/favicon.svg" alt="seal" className="w-7 h-7" />
          <div className="flex flex-col justify-center">
          <span className="font-mono text-sm leading-none" style={{ color: '#1C69D4' }}>
            Nathan Fagan
          </span>
          <span className="font-mono text-xs mt-0.5 leading-none" style={{ color: '#71717A' }}>
            &gt; CCIE EI CANDIDATE
          </span>
          </div>
        </div>

        {/* Center: nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'px-4 py-1 text-sm font-mono transition-all'
                  : 'px-4 py-1 text-sm font-mono transition-all hover:text-[#F4F4F5]'
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      color: '#1C69D4',
                      borderBottom: '2px solid #1C69D4',
                      paddingBottom: '2px',
                    }
                  : {
                      color: '#71717A',
                      borderBottom: '2px solid transparent',
                      paddingBottom: '2px',
                    }
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right: status + auth — hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 ml-auto shrink-0">
          <span className="font-mono text-xs" style={{ color: '#22C55E' }}>
            ● ONLINE
          </span>
          {authenticated && (
            <>
              <span
                className="font-mono text-xs max-w-[160px] truncate"
                style={{ color: '#71717A' }}
              >
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-mono transition-colors"
                style={{ color: '#71717A' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
              >
                <LogOut size={12} />
                logout
              </button>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden ml-auto flex items-center justify-center p-1"
          style={{ color: '#71717A' }}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex flex-col"
          style={{
            background: '#09090b',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-5 py-3 text-sm font-mono'
                  : 'flex items-center gap-3 px-5 py-3 text-sm font-mono hover:text-[#F4F4F5]'
              }
              style={({ isActive }) =>
                isActive
                  ? { color: '#1C69D4', borderLeft: '2px solid #1C69D4' }
                  : { color: '#71717A', borderLeft: '2px solid transparent' }
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="font-mono text-xs" style={{ color: '#22C55E' }}>
              ● ONLINE
            </span>
            {authenticated && (
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-xs max-w-[160px] truncate"
                  style={{ color: '#71717A' }}
                >
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-mono transition-colors"
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
        </div>
      )}
    </nav>
  )
}

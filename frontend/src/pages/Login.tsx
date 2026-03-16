import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../lib/auth'
import { LogIn } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from ?? '/quiz'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(email.trim())
    if (ok) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      }).catch(() => {})
      navigate(from, { replace: true })
    } else {
      setError('Access denied.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#09090b' }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <p
            className="font-mono text-2xl"
            style={{ color: '#1C69D4' }}
          >
            // CCIE STUDY
          </p>
          <p className="text-[#71717A] text-sm mt-1 font-mono">&gt; AUTHENTICATION REQUIRED</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
            boxShadow: '0 0 30px rgba(28,105,212,0.06)',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#71717A] uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full rounded px-3 py-2.5 font-mono text-sm outline-none transition-all"
              style={{
                background: '#18181b',
                border: '1px solid rgba(28,105,212,0.25)',
                color: '#F4F4F5',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(28,105,212,0.6)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(28,105,212,0.25)')}
            />
          </div>

          {error && (
            <p
              className="text-xs font-mono"
              style={{ color: '#EF4444' }}
            >
              ✗ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-cyber flex items-center justify-center gap-2 py-2.5 rounded font-mono text-sm"
          >
            <LogIn size={14} />
            [ LOGIN ]
          </button>
        </form>
      </div>
    </div>
  )
}

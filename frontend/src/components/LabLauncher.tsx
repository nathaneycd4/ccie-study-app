import { useState } from 'react'
import { FlaskConical, Loader2 } from 'lucide-react'
import type { LabCreate } from '../types'

const TOPICS = ['ospf', 'bgp', 'eigrp']

interface Props {
  onLaunch: (data: LabCreate) => void
  loading: boolean
  defaultTopic?: string
  defaultFaultCount?: number
}

export default function LabLauncher({ onLaunch, loading, defaultTopic, defaultFaultCount }: Props) {
  const [topic, setTopic] = useState(defaultTopic ?? 'ospf')
  const [faultCount, setFaultCount] = useState(defaultFaultCount ?? 2)
  const [seed, setSeed] = useState('')

  const handleLaunch = () => {
    onLaunch({
      topic,
      fault_count: faultCount,
      seed: seed ? parseInt(seed, 10) : undefined,
    })
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(0,255,255,0.2)',
        boxShadow: '0 0 15px rgba(0,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(0,255,255,0.08)',
            border: '1px solid rgba(0,255,255,0.25)',
          }}
        >
          <FlaskConical size={18} style={{ color: '#00ffff' }} />
        </div>
        <div>
          <h3 className="text-sm font-mono text-[#e2e8f0]">Launch New Lab</h3>
          <p className="text-xs text-[#64748b] font-mono">CML topology with injected faults</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Topic */}
        <div>
          <label className="text-xs font-mono text-[#64748b] block mb-1.5">
            &gt; TOPIC
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded px-3 py-2 text-sm font-mono outline-none transition-all"
            style={{
              background: '#161b22',
              border: '1px solid rgba(0,255,255,0.2)',
              color: '#e2e8f0',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0,255,255,0.6)'
              e.target.style.boxShadow = '0 0 10px rgba(0,255,255,0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0,255,255,0.2)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t} style={{ background: '#161b22', color: '#e2e8f0' }}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Fault count */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-mono text-[#64748b]">&gt; FAULT_COUNT</label>
            <span className="font-mono font-bold text-sm" style={{ color: '#00ffff' }}>
              [{faultCount}]
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={faultCount}
            onChange={(e) => setFaultCount(parseInt(e.target.value, 10))}
            className="w-full"
            style={{ accentColor: '#00ffff' }}
          />
          <div className="flex justify-between text-xs text-[#64748b] mt-0.5 font-mono">
            <span>1 [easy]</span>
            <span>7 [brutal]</span>
          </div>
        </div>

        {/* Seed */}
        <div>
          <label className="text-xs font-mono text-[#64748b] block mb-1.5">
            &gt; SEED{' '}
            <span className="text-[#64748b] opacity-60">(optional — reproducible faults)</span>
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Leave blank for random"
            className="w-full rounded px-3 py-2 text-sm font-mono outline-none transition-all"
            style={{
              background: '#161b22',
              border: '1px solid rgba(0,255,255,0.2)',
              color: '#e2e8f0',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0,255,255,0.6)'
              e.target.style.boxShadow = '0 0 10px rgba(0,255,255,0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0,255,255,0.2)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="btn-cyber w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono text-sm uppercase tracking-wider"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Provisioning...</>
          ) : (
            <><FlaskConical size={15} /> [ Launch Lab ]</>
          )}
        </button>
      </div>
    </div>
  )
}

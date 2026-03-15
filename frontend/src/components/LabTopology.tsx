import type { Lab } from '../types'

interface Props {
  lab: Lab
}

// Fixed topology: R1-R2-R3 backbone, R4 off R1, R5 off R3
// All lab types share this same physical topology
const NODES = [
  { id: 'R1', x: 100, y: 120, label: 'R1' },
  { id: 'R2', x: 240, y: 120, label: 'R2' },
  { id: 'R3', x: 380, y: 120, label: 'R3' },
  { id: 'R4', x: 100, y: 240, label: 'R4' },
  { id: 'R5', x: 380, y: 240, label: 'R5' },
]

const LINKS = [
  { from: 'R1', to: 'R2' },
  { from: 'R2', to: 'R3' },
  { from: 'R1', to: 'R4' },
  { from: 'R3', to: 'R5' },
]

const ADDRESSING: Record<string, { links: { label: string; x: number; y: number }[]; loopback: string }> = {
  ospf: {
    links: [
      { label: '10.0.12.0/24', x: 170, y: 105 },
      { label: '10.0.23.0/24', x: 310, y: 105 },
      { label: '10.0.14.0/24', x: 75, y: 185 },
      { label: '10.0.35.0/24', x: 395, y: 185 },
    ],
    loopback: 'x.x.x.x/32',
  },
  bgp: {
    links: [
      { label: '10.0.12.0/24', x: 170, y: 105 },
      { label: '10.0.23.0/24', x: 310, y: 105 },
      { label: '10.0.14.0/24', x: 75, y: 185 },
      { label: '10.0.35.0/24', x: 395, y: 185 },
    ],
    loopback: 'x.x.x.x/32',
  },
  eigrp: {
    links: [
      { label: '10.0.12.0/24', x: 170, y: 105 },
      { label: '10.0.23.0/24', x: 310, y: 105 },
      { label: '10.0.14.0/24', x: 75, y: 185 },
      { label: '10.0.35.0/24', x: 395, y: 185 },
    ],
    loopback: 'x.x.x.x/32',
  },
}

const TOPIC_LABELS: Record<string, string> = {
  ospf: 'OSPF • Areas 0/1/2',
  bgp: 'BGP • AS 65001/65002/65003',
  eigrp: 'EIGRP • AS 100',
}

function nodePos(id: string) {
  return NODES.find((n) => n.id === id)!
}

export default function LabTopology({ lab }: Props) {
  const topic = lab.topic.toLowerCase()
  const addressing = ADDRESSING[topic] ?? ADDRESSING.ospf
  const topicLabel = TOPIC_LABELS[topic] ?? topic.toUpperCase()

  const isReady = lab.status === 'ready'
  const nodeColor = isReady ? '#00ff41' : lab.status === 'error' ? '#ff0040' : '#ffff00'
  const nodeBorder = isReady ? 'rgba(0,255,65,0.5)' : lab.status === 'error' ? 'rgba(255,0,64,0.5)' : 'rgba(255,255,0,0.5)'
  const linkColor = isReady ? 'rgba(0,255,255,0.4)' : 'rgba(100,116,139,0.3)'

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(0,255,255,0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono" style={{ color: '#00ffff' }}>
          // TOPOLOGY
        </h3>
        <span className="text-xs font-mono" style={{ color: '#64748b' }}>
          {topicLabel}
        </span>
      </div>

      <svg viewBox="0 0 480 290" className="w-full" style={{ maxHeight: '200px' }}>
        {/* Links */}
        {LINKS.map(({ from, to }) => {
          const a = nodePos(from)
          const b = nodePos(to)
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={linkColor}
              strokeWidth={1.5}
              strokeDasharray={isReady ? undefined : '4 3'}
            />
          )
        })}

        {/* Link labels */}
        {addressing.links.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            fill="rgba(100,116,139,0.8)"
            fontSize={8}
            fontFamily="monospace"
          >
            {l.label}
          </text>
        ))}

        {/* Nodes */}
        {NODES.map(({ id, x, y, label }) => (
          <g key={id}>
            <rect
              x={x - 22}
              y={y - 14}
              width={44}
              height={28}
              rx={4}
              fill="rgba(13,17,23,0.9)"
              stroke={nodeBorder}
              strokeWidth={1}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fill={nodeColor}
              fontSize={11}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {label}
            </text>
          </g>
        ))}

        {/* BGP AS labels */}
        {topic === 'bgp' && (
          <>
            <text x={240} y={20} textAnchor="middle" fill="rgba(0,255,255,0.4)" fontSize={9} fontFamily="monospace">AS 65001 (iBGP full-mesh)</text>
            <text x={100} y={278} textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize={8} fontFamily="monospace">AS 65002</text>
            <text x={380} y={278} textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize={8} fontFamily="monospace">AS 65003</text>
          </>
        )}

        {/* OSPF area labels */}
        {topic === 'ospf' && (
          <>
            <text x={240} y={20} textAnchor="middle" fill="rgba(0,255,255,0.4)" fontSize={9} fontFamily="monospace">Area 0 (backbone)</text>
            <text x={100} y={278} textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize={8} fontFamily="monospace">Area 1</text>
            <text x={380} y={278} textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize={8} fontFamily="monospace">Area 2</text>
          </>
        )}

        {/* EIGRP label */}
        {topic === 'eigrp' && (
          <text x={240} y={20} textAnchor="middle" fill="rgba(0,255,255,0.4)" fontSize={9} fontFamily="monospace">EIGRP AS 100</text>
        )}
      </svg>
    </div>
  )
}

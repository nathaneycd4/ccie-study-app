import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import type { ChatMessage } from '../types'
import { Bot, User, FlaskConical } from 'lucide-react'

interface Props {
  messages: ChatMessage[]
  streamingContent?: string
}

// Detect lab action in assistant message
function extractLabAction(content: string): { topic: string; fault_count: number } | null {
  const match = content.match(/\{"action"\s*:\s*"create_lab"[^}]+\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

function stripLabJson(content: string): string {
  return content.replace(/\{"action"\s*:\s*"create_lab"[^}]+\}\n?/g, '').trim()
}

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const navigate = useNavigate()
  const isUser = message.role === 'user'
  const labAction = !isUser ? extractLabAction(message.content) : null
  const displayContent = labAction ? stripLabJson(message.content) : message.content

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-1"
        style={
          isUser
            ? {
                background: 'rgba(148,163,184,0.12)',
                border: '1px solid rgba(148,163,184,0.35)',
              }
            : {
                background: 'rgba(28,105,212,0.08)',
                border: '1px solid rgba(28,105,212,0.3)',
              }
        }
      >
        {isUser ? (
          <User size={15} style={{ color: '#94A3B8' }} />
        ) : (
          <Bot size={15} style={{ color: '#1C69D4' }} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Role label */}
        <div
          className="text-xs font-mono mb-0.5"
          style={{ color: isUser ? '#94A3B8' : '#1C69D4' }}
        >
          {isUser ? '> USER:' : '> MENTOR.AI:'}
        </div>
        <div
          className="rounded px-4 py-3 text-sm leading-relaxed font-mono"
          style={
            isUser
              ? {
                  background: 'rgba(148,163,184,0.06)',
                  border: '1px solid rgba(148,163,184,0.25)',
                  color: '#F4F4F5',
                  borderRadius: '4px 4px 4px 0',
                }
              : {
                  background: '#111113',
                  border: '1px solid rgba(28,105,212,0.2)',
                  color: '#F4F4F5',
                  borderRadius: '4px 4px 4px 0',
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-code:font-mono prose-code:bg-[#18181b] prose-code:text-[#22C55E] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#111113] prose-pre:border prose-pre:border-[rgba(28,105,212,0.2)] prose-a:text-[#1C69D4] prose-strong:text-[#F4F4F5]">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Lab launch button */}
        {labAction && (
          <button
            onClick={() =>
              navigate('/labs', {
                state: { topic: labAction.topic, fault_count: labAction.fault_count },
              })
            }
            className="btn-cyber flex items-center gap-2 px-4 py-2 rounded text-sm font-mono"
          >
            <FlaskConical size={15} />
            [ Launch {labAction.topic.toUpperCase()} Lab — {labAction.fault_count} faults ]
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChatThread({ messages, streamingContent }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      {messages.length === 0 && !streamingContent && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
          <div
            className="w-14 h-14 rounded flex items-center justify-center"
            style={{
              background: 'rgba(28,105,212,0.08)',
              border: '1px solid rgba(28,105,212,0.3)',
              boxShadow: '0 0 20px rgba(28,105,212,0.08)',
            }}
          >
            <Bot size={28} style={{ color: '#1C69D4' }} />
          </div>
          <h3
            className="text-lg font-mono"
            style={{ color: '#1C69D4' }}
          >
            CCIE EI Mentor
            <span className="animate-blink ml-1">_</span>
          </h3>
          <p className="text-[#71717A] max-w-sm text-sm leading-relaxed font-mono">
            Ask me anything about OSPF, BGP, EIGRP, MPLS, SD-WAN, or any other CCIE EI topic.
            I can also spin up troubleshooting labs for you.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {[
              'Explain OSPF LSA types',
              'BGP best path selection',
              'Create an OSPF lab',
              'MPLS LDP troubleshooting',
            ].map((prompt) => (
              <span
                key={prompt}
                className="text-xs font-mono px-3 py-1.5 rounded"
                style={{
                  background: '#111113',
                  border: '1px solid rgba(28,105,212,0.15)',
                  color: '#71717A',
                }}
              >
                &gt; {prompt}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Streaming assistant message */}
      {streamingContent && (
        <div className="flex gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-1"
            style={{
              background: 'rgba(28,105,212,0.08)',
              border: '1px solid rgba(28,105,212,0.3)',
            }}
          >
            <Bot size={15} style={{ color: '#1C69D4' }} />
          </div>
          <div>
            <div className="text-xs font-mono mb-0.5" style={{ color: '#1C69D4' }}>
              &gt; MENTOR.AI:
            </div>
            <div
              className="max-w-[75%] rounded px-4 py-3 font-mono"
              style={{
                background: '#111113',
                border: '1px solid rgba(28,105,212,0.2)',
              }}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-code:font-mono prose-code:bg-[#18181b] prose-code:text-[#22C55E] prose-code:px-1 prose-code:rounded prose-pre:bg-[#111113] prose-pre:border prose-pre:border-[rgba(28,105,212,0.2)]">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
              <span
                className="inline-block w-1.5 h-4 ml-0.5 animate-blink"
                style={{ background: '#1C69D4' }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

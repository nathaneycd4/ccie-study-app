import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Props {
  onSend: (content: string) => void
  loading: boolean
  disabled?: boolean
}

export default function ChatInput({ onSend, loading, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div
      className="px-6 py-4"
      style={{
        background: '#09090b',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="flex items-end gap-3 rounded px-4 py-3 transition-all"
        style={{
          background: '#111113',
          border: '1px solid rgba(28,105,212,0.25)',
        }}
        onFocusCapture={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(28,105,212,0.6)'
          el.style.boxShadow = '0 0 15px rgba(28,105,212,0.12)'
        }}
        onBlurCapture={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(28,105,212,0.25)'
          el.style.boxShadow = 'none'
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="> Ask about OSPF, BGP, MPLS... or request a lab"
          disabled={loading || disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed max-h-40 font-mono"
          style={{
            color: '#F4F4F5',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || loading || disabled}
          className="w-8 h-8 rounded flex items-center justify-center shrink-0 transition-all mb-0.5"
          style={{
            background: 'transparent',
            border: '1px solid rgba(28,105,212,0.4)',
            color: '#1C69D4',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = 'rgba(28,105,212,0.1)'
              e.currentTarget.style.boxShadow = '0 0 10px rgba(28,105,212,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" style={{ color: '#1C69D4' }} />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>
      <p className="text-xs text-[#71717A] mt-2 text-center font-mono">
        Shift+Enter for new line • Enter to send
      </p>
    </div>
  )
}

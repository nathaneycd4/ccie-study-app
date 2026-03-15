import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import ChatThread from '../components/ChatThread'
import ChatInput from '../components/ChatInput'
import { Trash2 } from 'lucide-react'
import type { ChatMessage } from '../types'

function getOrCreateSessionId(): string {
  const key = 'ccie-chat-session-id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(key, id)
  }
  return id
}

export default function Chat() {
  const sessionId = getOrCreateSessionId()
  const queryClient = useQueryClient()
  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.progress.get(),
  })
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState(false)

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: () => api.chat.getHistory(sessionId),
  })

  const handleSend = async (content: string) => {
    if (isStreaming) return

    // Optimistically add user message to cache
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    queryClient.setQueryData<ChatMessage[]>(['chat-history', sessionId], (old = []) => [
      ...old,
      tempUserMsg,
    ])

    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await api.chat.streamMessage(sessionId, content)

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data) continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.delta) {
                accumulated += parsed.delta
                setStreamingContent(accumulated)
              } else if (parsed.done) {
                // Stream complete — refresh history from server
                setStreamingContent('')
                await queryClient.invalidateQueries({ queryKey: ['chat-history', sessionId] })
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleClear = async () => {
    await api.chat.clearHistory(sessionId)
    queryClient.setQueryData(['chat-history', sessionId], [])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: '#0a0a0f',
          borderBottom: '1px solid rgba(0,255,255,0.15)',
        }}
      >
        <div>
          <h1
            className="text-base font-mono"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}
          >
            // CCIE_EI_MENTOR
            <span className="animate-blink ml-1">_</span>
          </h1>
          <p className="text-xs text-[#64748b] font-mono mt-0.5">
            {progress?.current_module
              ? `Current module: ${progress.current_module}`
              : 'Powered by Claude • OSPF, BGP, MPLS, SD-WAN'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-[#64748b] font-mono px-3 py-1.5 rounded transition-colors"
          style={{ border: '1px solid rgba(255,0,64,0.2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff0040'
            e.currentTarget.style.borderColor = 'rgba(255,0,64,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.borderColor = 'rgba(255,0,64,0.2)'
          }}
        >
          <Trash2 size={13} />
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <ChatThread messages={messages} streamingContent={streamingContent || undefined} />

      {/* Input */}
      <ChatInput onSend={handleSend} loading={isStreaming} />
    </div>
  )
}

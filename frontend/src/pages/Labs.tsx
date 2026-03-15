import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import LabLauncher from '../components/LabLauncher'
import LabStatusCard from '../components/LabStatusCard'
import { FlaskConical, Loader2 } from 'lucide-react'
import type { LabCreate } from '../types'
import { useEffect } from 'react'

export default function Labs() {
  const location = useLocation()
  const queryClient = useQueryClient()

  // Pre-fill from chat navigation state
  const navState = location.state as { topic?: string; fault_count?: number } | null

  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['labs'],
    queryFn: () => api.labs.list(),
    refetchInterval: (query) => {
      // Poll while any lab is booting
      const data = query.state.data
      if (Array.isArray(data) && data.some((l) => l.status === 'booting')) {
        return 5000
      }
      return false
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: LabCreate) => api.labs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.labs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })

  // Auto-launch if navigated from chat with lab action
  useEffect(() => {
    if (navState?.topic && navState?.fault_count) {
      createMutation.mutate({
        topic: navState.topic,
        fault_count: navState.fault_count,
      })
      // Clear nav state
      window.history.replaceState({}, '')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-mono"
          style={{ color: '#00ffff', textShadow: '0 0 12px rgba(0,255,255,0.5)' }}
        >
          // LABS
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5 font-mono">
          &gt; CML topology builder with injected faults
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Launcher panel */}
        <div className="lg:col-span-1">
          <LabLauncher
            onLaunch={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
            defaultTopic={navState?.topic}
            defaultFaultCount={navState?.fault_count}
          />
        </div>

        {/* Lab list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-mono"
              style={{ color: '#00ffff' }}
            >
              // YOUR_LABS
            </h3>
            {isLoading && (
              <Loader2 size={14} className="animate-spin" style={{ color: '#00ffff' }} />
            )}
          </div>

          {labs.length === 0 && !isLoading && (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(0,255,255,0.2)',
              }}
            >
              <FlaskConical
                size={36}
                className="mx-auto mb-3"
                style={{ color: 'rgba(0,255,255,0.2)' }}
              />
              <p className="text-[#64748b] font-mono font-medium text-sm">No labs yet</p>
              <p className="text-[#64748b] opacity-60 text-xs mt-1 font-mono">
                Launch a lab to start troubleshooting
              </p>
            </div>
          )}

          {labs.map((lab) => (
            <LabStatusCard
              key={lab.id}
              lab={lab}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

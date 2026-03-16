import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { isAuthenticated } from '../lib/auth'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authenticated = isAuthenticated()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: () => api.blog.get(Number(id)),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.blog.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      navigate('/blog')
    },
  })

  const handleDelete = () => {
    if (window.confirm('Delete this post? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin" style={{ color: '#1C69D4' }} />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-sm font-mono mb-6 transition-colors"
          style={{ color: '#71717A' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4F5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
        >
          <ArrowLeft size={15} />
          &lt; Back to blog
        </button>
        <p className="font-mono text-sm" style={{ color: '#EF4444' }}>
          [ERROR] Post not found.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/blog')}
        className="flex items-center gap-2 text-sm font-mono transition-colors"
        style={{ color: '#71717A' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4F5')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
      >
        <ArrowLeft size={15} />
        &lt; Back to blog
      </button>

      {/* Post header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-mono font-bold leading-tight mb-3"
          style={{ color: '#F4F4F5' }}
        >
          {post.title}
        </h1>
        <p className="text-sm font-mono" style={{ color: '#71717A' }}>
          {post.author ? `${post.author} · ` : ''}{formatDate(post.created_at)}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                background: 'rgba(28,105,212,0.1)',
                border: '1px solid rgba(28,105,212,0.25)',
                color: '#1C69D4',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{
          background: '#111113',
          border: '1px solid rgba(28,105,212,0.2)',
        }}
      >
        <div
          className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: '#F4F4F5' }}
        >
          {post.content}
        </div>
      </div>

      {/* Delete button — authenticated only */}
      {authenticated && (
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            style={{
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Trash2 size={13} />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete post'}
          </button>
        </div>
      )}
    </div>
  )
}

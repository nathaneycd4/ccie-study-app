import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { isAdmin, getStoredEmail } from '../lib/auth'
import { BookOpen, Loader2, Plus, X } from 'lucide-react'
import type { BlogPostCreate } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Blog() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authenticated = isAdmin()
  const storedEmail = getStoredEmail()

  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [author, setAuthor] = useState(storedEmail ?? '')

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.blog.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: BlogPostCreate) => api.blog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      setTitle('')
      setContent('')
      setExcerpt('')
      setTagsInput('')
      setAuthor(storedEmail ?? '')
      setFormOpen(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      author: author.trim() || undefined,
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono" style={{ color: '#1C69D4' }}>
            // BLOG
          </h1>
          <p className="text-[#71717A] text-sm mt-0.5 font-mono">
            &gt; Notes, write-ups, and study logs
          </p>
        </div>
        {authenticated && (
          <button
            onClick={() => setFormOpen((o) => !o)}
            className="flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded transition-colors"
            style={{
              color: formOpen ? '#EF4444' : '#1C69D4',
              border: `1px solid ${formOpen ? 'rgba(239,68,68,0.3)' : 'rgba(28,105,212,0.3)'}`,
            }}
            onMouseEnter={(e) => {
              if (!formOpen) e.currentTarget.style.background = 'rgba(28,105,212,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {formOpen ? <X size={14} /> : <Plus size={14} />}
            {formOpen ? 'Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      {/* New post form */}
      {authenticated && formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-5 space-y-4"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          <h3 className="text-sm font-mono" style={{ color: '#1C69D4' }}>
            // NEW_POST
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: '#71717A' }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded px-3 py-2 text-sm font-mono outline-none focus:ring-1"
                style={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F4F4F5',
                }}
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: '#71717A' }}>
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full rounded px-3 py-2 text-sm font-mono outline-none resize-y focus:ring-1"
                style={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F4F4F5',
                }}
                placeholder="Write your post content..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: '#71717A' }}>
                Excerpt (optional)
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full rounded px-3 py-2 text-sm font-mono outline-none"
                style={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F4F4F5',
                }}
                placeholder="Short summary..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: '#71717A' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded px-3 py-2 text-sm font-mono outline-none"
                  style={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F4F4F5',
                  }}
                  placeholder="ospf, bgp, mpls"
                />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: '#71717A' }}>
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded px-3 py-2 text-sm font-mono outline-none"
                  style={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F4F4F5',
                  }}
                  placeholder="Author name"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || !title.trim() || !content.trim()}
            className="btn-cyber px-4 py-2 rounded font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Publishing...' : '[ Publish Post ]'}
          </button>
        </form>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin" style={{ color: '#1C69D4' }} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div
          className="rounded-xl p-10 text-center"
          style={{
            background: '#111113',
            border: '1px solid rgba(28,105,212,0.25)',
          }}
        >
          <BookOpen
            size={40}
            className="mx-auto mb-3"
            style={{ color: 'rgba(28,105,212,0.3)' }}
          />
          <p className="text-[#71717A] font-mono font-medium">No posts yet</p>
          <p className="text-[#71717A] opacity-60 text-sm mt-1 font-mono">
            {authenticated ? 'Create the first post above.' : 'Nothing published yet.'}
          </p>
        </div>
      )}

      {/* Post list */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => {
            const preview = post.excerpt ?? post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '')
            return (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="rounded-xl p-5 cursor-pointer transition-all"
                style={{
                  background: '#111113',
                  border: '1px solid rgba(28,105,212,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(28,105,212,0.45)'
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(28,105,212,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(28,105,212,0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <h2 className="text-lg font-mono font-semibold mb-1" style={{ color: '#1C69D4' }}>
                  {post.title}
                </h2>
                <p className="text-xs font-mono mb-3" style={{ color: '#71717A' }}>
                  {post.author ? `${post.author} · ` : ''}{formatDate(post.created_at)}
                </p>
                <p className="text-sm font-mono leading-relaxed mb-3" style={{ color: '#A1A1AA' }}>
                  {preview}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(28,105,212,0.08)',
                          border: '1px solid rgba(28,105,212,0.2)',
                          color: '#1C69D4',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

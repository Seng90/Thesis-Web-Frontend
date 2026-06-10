'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { fetchMyPosts, cancelFundraisingPost } from '@/lib/api'
import type { FundraisingPost } from '@/lib/types'
import { AlertCircle, Edit, XCircle, ArrowLeft, Loader2, Calendar } from 'lucide-react'

export default function MyPostsPage() {
  const { token, isLoading, user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<FundraisingPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/raises/my-posts')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        const data = await fetchMyPosts(token)
        setPosts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingPosts(false)
      }
    }
    load()
  }, [token])

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this fundraising post? This cannot be undone.')) return
    
    setCancelingId(id)
    try {
      await cancelFundraisingPost(id, token!)
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Cancelled' } : p))
    } catch (err) {
      console.error(err)
      alert('Failed to cancel post')
    } finally {
      setCancelingId(null)
    }
  }

  if (isLoading || loadingPosts) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Fundraising Posts
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your fundraising history, respond to feedback, or cancel active rounds.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 mb-6">You haven't posted any fundraising rounds yet.</p>
            <Link href="/raises/new" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              Create a Raise
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row gap-6">
                
                {/* Image */}
                <div className="w-full md:w-48 h-32 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  {post.coverUrl ? (
                    <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {post.companyName} &middot; {post.roundType}
                      </p>
                    </div>
                    
                    {/* Status Pill */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      post.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      post.status === 'Expired' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      post.status === 'Hidden' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {post.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <div>
                      Target: ${post.targetAmountUsd.toLocaleString()}
                    </div>
                  </div>

                  {/* Hidden Feedback Alert */}
                  {post.status === 'Hidden' && post.adminFeedback && (
                    <div className="mb-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Action Required</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                            {post.adminFeedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/raises/${post.slug}`}
                      className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                    >
                      View Post
                    </Link>
                    
                    <div className="flex-1"></div>

                    {/* Edit is allowed for Active and Hidden */}
                    {(post.status === 'Active' || post.status === 'Hidden') && (
                      <Link
                        href={`/raises/${post.slug}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Link>
                    )}

                    {/* Cancel is allowed for Active and Hidden */}
                    {(post.status === 'Active' || post.status === 'Hidden') && (
                      <button
                        onClick={() => handleCancel(post.id)}
                        disabled={cancelingId === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

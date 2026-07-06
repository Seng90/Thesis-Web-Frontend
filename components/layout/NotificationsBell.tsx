'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth, hasPermission } from '@/lib/auth'
import { fetchMyPosts } from '@/lib/api'
import type { FundraisingPost } from '@/lib/types'

export default function NotificationsBell() {
  const { user, token } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const [hiddenPosts, setHiddenPosts] = useState<FundraisingPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadNotifications() {
      if (!token) return
      setIsLoading(true)
      try {
        const posts = await fetchMyPosts(token)
        const filtered = posts.filter(p => p.status === 'Hidden' && p.adminFeedback)
        setHiddenPosts(filtered)
      } catch (err) {
        console.error('Failed to load notifications', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && token && hasPermission(user, 'create:fundraising-posts')) {
      loadNotifications()
    }
  }, [user, token, pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const unreadCount = hiddenPosts.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-surface-800 shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden animate-fade-in origin-top-right z-50">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : hiddenPosts.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {hiddenPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => {
                      setIsOpen(false)
                      router.push(`/raises/${post.slug}/edit`)
                    }}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                        Action Required: {post.title}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 line-clamp-2 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                        {post.adminFeedback || 'There is an issue with your post.'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                You have no new notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

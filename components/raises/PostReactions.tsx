'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { fetchPostReactions } from '@/lib/api'
import type { PostReactionSummary } from '@/lib/types'
import ReactionButtons from './ReactionButtons'

export default function PostReactions({ postId }: { postId: string }) {
  const { token } = useAuth()
  const [summary, setSummary] = useState<PostReactionSummary | null>(null)

  useEffect(() => {
    async function loadReactions() {
      try {
        const data = await fetchPostReactions(postId, token || undefined)
        setSummary(data)
      } catch (e) {
        console.error('Failed to load post reactions', e)
      }
    }
    loadReactions()
  }, [postId, token])

  if (!summary) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>
    )
  }

  return (
    <ReactionButtons 
      targetId={postId}
      targetType="post"
      initialLikes={summary.likes}
      initialDislikes={summary.dislikes}
      initialReaction={summary.currentUserReaction}
    />
  )
}

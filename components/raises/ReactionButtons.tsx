'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface ReactionButtonsProps {
  targetId: string
  targetType: 'post' | 'comment'
  initialLikes: number
  initialDislikes: number
  initialReaction: 'LIKE' | 'DISLIKE' | null
}

export default function ReactionButtons({
  targetId,
  targetType,
  initialLikes,
  initialDislikes,
  initialReaction,
}: ReactionButtonsProps) {
  const { user, token } = useAuth()
  
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [reaction, setReaction] = useState<'LIKE' | 'DISLIKE' | null>(initialReaction)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleReact = async (type: 'LIKE' | 'DISLIKE') => {
    if (!user || !token) {
      alert('Please log in to react.')
      return
    }
    if (isUpdating) return

    const newReaction = reaction === type ? 'NONE' : type
    
    // Optimistic Update
    setIsUpdating(true)
    const prevReaction = reaction
    const prevLikes = likes
    const prevDislikes = dislikes

    if (newReaction === 'NONE') {
      if (prevReaction === 'LIKE') setLikes(l => l - 1)
      if (prevReaction === 'DISLIKE') setDislikes(d => d - 1)
      setReaction(null)
    } else {
      if (newReaction === 'LIKE') {
        setLikes(l => l + 1)
        if (prevReaction === 'DISLIKE') setDislikes(d => d - 1)
      } else {
        setDislikes(d => d + 1)
        if (prevReaction === 'LIKE') setLikes(l => l - 1)
      }
      setReaction(newReaction)
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const endpoint = targetType === 'post' 
        ? `/user/fundraising-posts/${targetId}/react`
        : `/user/comments/${targetId}/react`

      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: newReaction })
      })

      if (!res.ok) {
        throw new Error('Failed to react')
      }
    } catch (e) {
      console.error(e)
      // Revert Optimistic Update
      setLikes(prevLikes)
      setDislikes(prevDislikes)
      setReaction(prevReaction)
      alert('Failed to update reaction.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => handleReact('LIKE')}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          reaction === 'LIKE' 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        <ThumbsUp className={`w-4 h-4 ${reaction === 'LIKE' ? 'fill-current' : ''}`} />
        <span>{likes > 0 ? likes : ''}</span>
      </button>

      <button 
        onClick={() => handleReact('DISLIKE')}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          reaction === 'DISLIKE' 
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        <ThumbsDown className={`w-4 h-4 ${reaction === 'DISLIKE' ? 'fill-current' : ''}`} />
        <span>{dislikes > 0 ? dislikes : ''}</span>
      </button>
    </div>
  )
}

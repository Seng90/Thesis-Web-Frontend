'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchPostComments, addPostComment } from '../api/raisesApi'
import { useAuth } from '@/lib/auth'
import type { PostComment } from '@/lib/types'

export function useCommentSection(postId: string) {
  const { user, token } = useAuth()
  
  const [comments, setComments] = useState<PostComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await fetchPostComments(postId, token || undefined)
        setComments(data)
      } catch (e) {
        console.error('Failed to load comments', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadComments()
  }, [postId, token])

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !token) return

    setIsSubmitting(true)
    try {
      const raw = await addPostComment(postId, newComment.trim(), token)
      
      const createdComment: PostComment = {
        id: raw.id,
        content: raw.content,
        createdAt: raw.created_at ?? raw.createdAt,
        username: raw.member?.username ?? user?.username ?? 'You',
        avatarUrl: raw.member?.avatar_url ?? user?.avatarUrl ?? null,
        likes: 0,
        dislikes: 0,
        currentUserReaction: null,
      }
      
      setComments(prev => [createdComment, ...prev])
      setNewComment('')
    } catch (e) {
      console.error('[useCommentSection] Submit error:', e)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [postId, newComment, token, user])

  return {
    user,
    token,
    comments,
    newComment,
    isSubmitting,
    isLoading,
    mounted,
    handleCommentChange,
    handleSubmit
  }
}

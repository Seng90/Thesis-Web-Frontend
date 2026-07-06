/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch, authFetch, API_BASE } from '@/lib/apiClient'
import { mapFundraisingPost, mapFundingRound } from '@/lib/mappers'
import type { FundraisingPost, PostReactionSummary, PostComment, FundingRound } from '@/lib/types'



export async function fetchFundraisingPosts(): Promise<FundraisingPost[]> {
  const data = await apiFetch<unknown[]>('/user/fundraising-posts')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFundraisingPost)
}

export async function fetchFundraisingPostBySlug(slug: string): Promise<FundraisingPost | null> {
  const data = await apiFetch<unknown>(`/user/fundraising-posts/${slug}`)
  if (!data) return null
  return mapFundraisingPost(data)
}

export async function fetchMyPosts(token: string): Promise<FundraisingPost[]> {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/my-posts`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch my posts')
  const data = await res.json()
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFundraisingPost)
}

export async function fetchPostReactions(id: string, token?: string): Promise<PostReactionSummary> {
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/reactions`, {
    headers,
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch post reactions')
  return await res.json()
}

export async function reactToPost(postId: string, type: 'LIKE' | 'DISLIKE' | 'NONE', token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${postId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ type })
  })
  if (!res.ok) throw new Error('Failed to react to post')
  return res
}

export async function reactToComment(commentId: string, type: 'LIKE' | 'DISLIKE' | 'NONE', token: string) {
  const res = await authFetch(`${API_BASE}/user/comments/${commentId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ type })
  })
  if (!res.ok) throw new Error('Failed to react to comment')
  return res
}

export async function fetchPostComments(postId: string, token?: string): Promise<PostComment[]> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${postId}/comments`, {
    headers,
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch post comments')
  const rawData = await res.json()
  return rawData.map((c: any) => ({
    id: c.id,
    content: c.content,
    createdAt: c.created_at,
    username: c.member?.username ?? 'Unknown',
    avatarUrl: c.member?.avatar_url ?? null,
    likes: c.likes ?? 0,
    dislikes: c.dislikes ?? 0,
    currentUserReaction: c.currentUserReaction ?? null,
  }))
}

export async function addPostComment(postId: string, content: string, token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error('Failed to add comment')
  return res.json()
}

export async function updateFundraisingPost(id: string, token: string, payload: Record<string, any>) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to update fundraising post')
  return res.json()
}

export async function repostFundraisingPost(id: string, token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/repost`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to repost post')
  return res.json()
}

export async function cancelFundraisingPost(id: string, token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to cancel post')
  return res.json()
}

export async function fetchFundingRounds(): Promise<FundingRound[]> {
  const data = await apiFetch<unknown[]>('/user/funding-rounds')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFundingRound)
}






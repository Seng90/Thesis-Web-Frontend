import { apiFetch, authFetch } from '@/lib/apiClient'
import type { AuthUser } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function fetchProfile(token: string) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res
}

export async function updateProfile(token: string, data: { username: string; avatarUrl?: string }) {
  const res = await authFetch(`${API_BASE}/user/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      username: data.username,
      avatar_url: data.avatarUrl
    })
  })
  return res
}

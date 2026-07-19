let defaultApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
if (typeof window !== 'undefined' && defaultApiBase.includes('localhost') && window.location.hostname !== 'localhost') {
  defaultApiBase = defaultApiBase.replace('localhost', window.location.hostname)
}
export const API_BASE = defaultApiBase

export async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let res = await fetch(url, options)
  if (res.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('investrack_refresh_token')
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        localStorage.setItem('investrack_token', data.access_token)
        localStorage.setItem('investrack_refresh_token', data.refresh_token)
        window.dispatchEvent(new CustomEvent('investrack_token_refreshed', { detail: data.access_token }))
        const newHeaders = new Headers(options.headers)
        newHeaders.set('Authorization', `Bearer ${data.access_token}`)
        res = await fetch(url, { ...options, headers: newHeaders })
      } else {
        window.dispatchEvent(new Event('investrack_force_logout'))
      }
    } else {
      window.dispatchEvent(new Event('investrack_force_logout'))
    }
  }
  return res
}

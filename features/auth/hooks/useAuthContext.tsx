// ==========================================
// InvesTrack Auth Context (Refactored)
// JWT Token + User State Management
// ==========================================

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { API_BASE } from '@/lib/apiClient'
import type { AuthUser } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithToken: (token: string, refreshToken?: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('investrack_token')
    localStorage.removeItem('investrack_refresh_token')
    localStorage.removeItem('investrack_user')
  }

  const persistSession = (newToken: string, newRefreshToken: string | null, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('investrack_token', newToken)
    if (newRefreshToken) localStorage.setItem('investrack_refresh_token', newRefreshToken)
    localStorage.setItem('investrack_user', JSON.stringify(newUser))
  }

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('investrack_token')
      const savedUser = localStorage.getItem('investrack_user')
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch {
      localStorage.removeItem('investrack_token')
      localStorage.removeItem('investrack_refresh_token')
      localStorage.removeItem('investrack_user')
    } finally {
      setIsLoading(false)
    }

    const handleTokenRefreshed = ((e: CustomEvent<string>) => {
      const newToken = e.detail
      setToken(newToken)
      try {
        const base64Url = newToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const payload = JSON.parse(jsonPayload)
        const authUser: AuthUser = {
          id: payload.sub ?? payload.id ?? '',
          username: payload.username ?? '',
          email: payload.email ?? '',
          role: payload.roles?.[0] ?? 'user',
          roles: payload.roles ?? [],
          permissions: payload.permissions ?? [],
          avatarUrl: payload.avatar_url ?? payload.avatarUrl ?? '',
        }
        setUser(authUser)
        localStorage.setItem('investrack_user', JSON.stringify(authUser))
      } catch (err) {
        console.error('Failed to decode refreshed token', err)
      }
    }) as EventListener

    const handleForceLogout = () => {
      clearSession()
      window.location.href = '/login'
    }

    window.addEventListener('investrack_token_refreshed', handleTokenRefreshed)
    window.addEventListener('investrack_force_logout', handleForceLogout)

    return () => {
      window.removeEventListener('investrack_token_refreshed', handleTokenRefreshed)
      window.removeEventListener('investrack_force_logout', handleForceLogout)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        return {
          success: false,
          error: errorData?.message || 'Invalid email or password',
        }
      }

      const data = await res.json()
      const authUser: AuthUser = {
        id: data.user?.id ?? '',
        username: data.user?.username ?? '',
        email: data.user?.email ?? email,
        role: data.user?.roles?.[0] ?? 'user',
        roles: data.user?.roles ?? [],
        permissions: data.user?.permissions ?? [],
        avatarUrl: data.user?.avatar_url ?? data.user?.avatarUrl ?? '',
      }

      persistSession(data.access_token, data.refresh_token, authUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'user' }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        return {
          success: false,
          error: errorData?.message || 'Failed to create account. Email may already be in use.',
        }
      }

      const loginResult = await login(email, password)
      if (!loginResult.success) {
        return { success: true }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
  }, [login])

  const loginWithToken = useCallback((newToken: string, refreshToken?: string) => {
    try {
      const base64Url = newToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)

      const authUser: AuthUser = {
        id: payload.sub ?? payload.id ?? '',
        username: payload.username ?? '',
        email: payload.email ?? '',
        role: payload.roles?.[0] ?? 'user',
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
        avatarUrl: payload.avatar_url ?? payload.avatarUrl ?? '',
      }

      persistSession(newToken, refreshToken || null, authUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Invalid token received.' }
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [])

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const newUser = { ...prev, ...data }
      if (token) persistSession(token, localStorage.getItem('investrack_refresh_token'), newUser)
      return newUser
    })
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, loginWithToken, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  return user?.permissions?.includes(permission) ?? false
}

export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  return permissions.some(p => user?.permissions?.includes(p))
}

export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false
}

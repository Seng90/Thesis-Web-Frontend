// ==========================================
// InvesTrack Auth Context
// JWT Token + User State Management
// ==========================================

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// --- Types ---

export interface AuthUser {
  id: string
  username?: string
  email?: string
  role?: string
  avatarUrl?: string
}

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

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('investrack_token')
      const savedUser = localStorage.getItem('investrack_user')
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem('investrack_token')
      localStorage.removeItem('investrack_refresh_token')
      localStorage.removeItem('investrack_user')
    } finally {
      setIsLoading(false)
    }

    const handleTokenRefreshed = ((e: CustomEvent<string>) => {
      setToken(e.detail)
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

  // Save to localStorage when token/user changes
  const persistSession = (newToken: string, newRefreshToken: string | null, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('investrack_token', newToken)
    if (newRefreshToken) localStorage.setItem('investrack_refresh_token', newRefreshToken)
    localStorage.setItem('investrack_user', JSON.stringify(newUser))
  }

  const clearSession = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('investrack_token')
    localStorage.removeItem('investrack_refresh_token')
    localStorage.removeItem('investrack_user')
  }

  // --- Login ---
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/member/login`, {
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
        role: data.user?.role ?? 'member',
        avatarUrl: data.user?.avatar_url ?? data.user?.avatarUrl ?? '',
      }

      persistSession(data.access_token, data.refresh_token, authUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
  }, [])

  // --- Signup ---
  const signup = useCallback(async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Create member account
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        return {
          success: false,
          error: errorData?.message || 'Failed to create account. Email may already be in use.',
        }
      }

      // Step 2: Auto-login after signup
      const loginResult = await login(email, password)
      if (!loginResult.success) {
        return { success: true } // Account created but auto-login failed — user can login manually
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
  }, [login])

  // --- Login with Token (Google Auth) ---
  const loginWithToken = useCallback((newToken: string, refreshToken?: string) => {
    try {
      // Decode JWT payload (base64)
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
        role: payload.role ?? 'member',
        avatarUrl: payload.avatar_url ?? payload.avatarUrl ?? '',
      }

      persistSession(newToken, refreshToken || null, authUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Invalid token received.' }
    }
  }, [])

  // --- Logout ---
  const logout = useCallback(() => {
    clearSession()
  }, [])

  // --- Update User ---
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

// --- Hook ---

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

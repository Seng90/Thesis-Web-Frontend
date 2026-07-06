// ==========================================
// InvesTrack Auth Context
// JWT Token + User State Management
// ==========================================

'use client'

export {
  AuthProvider,
  useAuth,
  hasPermission,
  hasAnyPermission,
  hasRole,
} from '@/features/auth/hooks/useAuthContext'

export type { AuthUser } from '@/lib/types'

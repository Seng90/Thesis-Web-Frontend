'use client'

import { useAuth, hasPermission } from '@/lib/auth'

interface PermissionGuardProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth()
  if (!user || !hasPermission(user, permission)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}

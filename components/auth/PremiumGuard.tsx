'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    async function checkPremium() {
      if (authLoading) return
      
      if (!user || !token) {
        // Not logged in, redirect to login
        router.push('/login?redirect=' + window.location.pathname)
        setIsChecking(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const pkg = data.packageId || data.package_id || 'Free'
          
          if (pkg === 'Free Plan' || pkg.toLowerCase() === 'free') {
            // Free members are not allowed, redirect to pricing
            router.push('/pricing')
          } else {
            setHasAccess(true)
          }
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error(err)
        router.push('/')
      } finally {
        setIsChecking(false)
      }
    }

    checkPremium()
  }, [user, token, authLoading, router])

  if (authLoading || isChecking) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!hasAccess) return null

  return <>{children}</>
}

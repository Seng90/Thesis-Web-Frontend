'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      const result = loginWithToken(token)
      if (result.success) {
        // Redirect to home after successful login
        router.push('/')
      } else {
        // Redirect to login with error
        router.push('/login?error=auth_failed')
      }
    } else {
      router.push('/login')
    }
  }, [searchParams, loginWithToken, router])

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-800">Authenticating...</h2>
      <p className="text-slate-500 mt-2">Please wait while we log you in.</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-800">Loading...</h2>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}

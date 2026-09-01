'use client'

import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function AuthWall({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="relative overflow-hidden group">
        <div className="filter blur-md opacity-50 pointer-events-none select-none transition-all duration-300">
          {children}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden group rounded-2xl w-full h-full min-h-[300px]">
        <div className="filter blur-md opacity-30 pointer-events-none select-none transition-all duration-500 w-full h-full">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/10 dark:bg-slate-900/10">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 max-w-sm text-center transform transition-all hover:scale-105">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Member Only Feature</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Please sign in to view detailed analytics, funding history, and investor information.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                Sign In
              </Link>
              <Link href="/signup" className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 transition-colors shadow-sm">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

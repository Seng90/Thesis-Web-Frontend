'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function PricingPlanActions({ pkgId, price, popular }: { pkgId: string, price: number, popular: boolean }) {
  const { token } = useAuth()
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentPackageId(data.packageId || data.package_id || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [token])

  if (isLoading) {
    return <div className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
  }

  // If user has no package ID and price is 0, they are on free plan
  const isCurrentPlan = currentPackageId === pkgId || (price === 0 && (!currentPackageId || currentPackageId === 'Free Plan' || currentPackageId === 'free'))

  if (isCurrentPlan) {
    return (
      <button disabled className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-not-allowed">
        Current Plan
      </button>
    )
  }

  return (
    <Link
      href={price > 0 ? `/checkout/${pkgId}` : "/companies"}
      className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
        popular
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {price > 0 ? 'Upgrade Now' : 'Start Free'}
      {price > 0 && <ArrowRight className="h-4 w-4" />}
    </Link>
  )
}

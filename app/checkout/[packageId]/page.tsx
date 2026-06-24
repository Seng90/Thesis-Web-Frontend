'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Check, Lock, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const { packageId } = useParams() as { packageId: string }
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pkg, setPkg] = useState<{ name: string; price: number } | null>(null)

  useEffect(() => {
    const fetchPkg = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const res = await fetch(`${apiUrl}/user/packages/${packageId}`)
        if (res.ok) {
          const data = await res.json()
          setPkg(data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchPkg()
  }, [packageId])

  const handleMockPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirect=/checkout/' + packageId)
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${apiUrl}/user/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('investrack_token')}`
        },
        body: JSON.stringify({ memberId: user.id, packageId })
      })

      if (!response.ok) {
        throw new Error('Payment failed')
      }

      // If user is just a 'user', upgrade them to 'membership' in the frontend session
      if (user.role?.toLowerCase() === 'user') {
        updateUser({ role: 'membership' })
      }

      // Success
      router.push('/dashboard?payment=success')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <Lock className="w-8 h-8 mx-auto mb-4 opacity-80" />
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-indigo-200 mt-2">Test Mode (Mock Data)</p>
        </div>

        <form onSubmit={handleMockPayment} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Selected Package: {pkg ? pkg.name : 'Loading...'}
            </h3>
            {pkg && (
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-2">
                ${Number(pkg.price).toLocaleString()}
              </p>
            )}
            <p className="text-slate-500 text-xs">ID: {packageId}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Card Information</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value="4242 4242 4242 4242" 
                  readOnly 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value="12/26" readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              <input type="text" value="123" readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : `Pay & Upgrade`}
            {!loading && <Check className="w-4 h-4" />}
          </button>
          
          <p className="text-center text-xs text-slate-400 mt-4">
            This is a mock payment gateway. No real money will be charged.
          </p>
        </form>
      </div>
    </div>
  )
}

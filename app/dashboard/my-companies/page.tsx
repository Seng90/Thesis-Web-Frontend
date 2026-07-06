'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, hasPermission } from '@/lib/auth'
import { fetchMyManagedCompanies } from '@/features/companies/api/companiesApi'
import type { CompanyWithRelations } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import CompanyLogo from '@/components/ui/CompanyLogo'
import { AlertCircle, Edit, ArrowLeft, Loader2, MapPin, TrendingUp, Tag } from 'lucide-react'

export default function MyCompaniesPage() {
  const { token, isLoading, user } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyWithRelations[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/dashboard/my-companies')
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function load() {
      if (!token || !user || !hasPermission(user, 'read:own-managed-companies')) return
      try {
        const data = await fetchMyManagedCompanies(token)
        setCompanies(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingCompanies(false)
      }
    }
    load()
  }, [token, user])

  if (isLoading || (user && hasPermission(user, 'read:own-managed-companies') && loadingCompanies)) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user || !hasPermission(user, 'read:own-managed-companies')) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
        <div className="w-full max-w-md text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-2xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            You must be registered as a founder to view and manage companies.
          </p>
          <Link href="/login?redirect=/dashboard/my-companies" className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
            Log In as Founder
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-50 dark:bg-surface-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center text-sm text-surface-500 hover:text-primary-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            My Companies
          </h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            View and manage details of the companies you represent.
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-12 text-center shadow-sm">
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              You are not currently set up as a manager for any companies.
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 max-w-md mx-auto">
              Please contact an administrator to associate your account with your company or request a company manager role.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => {
              const investments = company.investments || []
              const totalFunding = investments.reduce((sum: number, inv) => sum + (inv.currency === 'USD' ? inv.amount : 0), 0)
              
              let stage = 'Bootstrapped'
              if (investments.length > 0) {
                const latest = [...investments].sort((a, b) => new Date(b.investDate).getTime() - new Date(a.investDate).getTime())[0]
                stage = latest.round?.roundName || 'Undisclosed'
              }

              const formattedFunding = totalFunding > 0 
                ? formatCurrency(totalFunding) 
                : (investments.length > 0 ? 'Undisclosed' : '$0')

              return (
                <div key={company.id} className="group relative flex flex-col rounded-2xl border border-surface-200/60 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* Top: Logo & Info */}
                  <div className="mb-4 flex items-start gap-4">
                    <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {company.name}
                      </h3>
                      {company.industry && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-500/10 px-2.5 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
                          {company.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Description */}
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-surface-500 dark:text-surface-400 line-clamp-3">
                    {company.description || 'No description provided.'}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-surface-100 dark:border-surface-800 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-surface-400 dark:text-surface-500 uppercase tracking-wider">Location</span>
                      <span className="mt-0.5 flex items-center gap-1 font-semibold text-surface-700 dark:text-surface-300">
                        <MapPin className="h-3.5 w-3.5 text-surface-400" />
                        {company.location || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-surface-400 dark:text-surface-500 uppercase tracking-wider">Stage</span>
                      <span className="mt-0.5 flex items-center gap-1 font-semibold text-surface-700 dark:text-surface-300">
                        <Tag className="h-3.5 w-3.5 text-surface-400" />
                        {stage}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-surface-100 dark:border-surface-800 pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-surface-400 dark:text-surface-500 uppercase tracking-wider">Total Raised</span>
                      <span className="mt-0.5 flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {formattedFunding}
                      </span>
                    </div>
                    
                    <Link
                      href={`/dashboard/my-companies/${company.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

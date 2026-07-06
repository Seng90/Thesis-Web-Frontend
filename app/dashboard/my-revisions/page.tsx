'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, hasPermission } from '@/lib/auth'
import { fetchMyRevisions } from '@/features/companies/api/companiesApi'
import { formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertCircle 
} from 'lucide-react'
import type { CompanyRevision } from '@/lib/types'

export default function MyRevisionsPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const [revisions, setRevisions] = useState<CompanyRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user || !hasPermission(user, 'read:own-revisions')) {
      setLoading(false)
      return
    }

    async function loadRevisions() {
      try {
        setLoading(true)
        if (!token) return
        const data = await fetchMyRevisions(token)
        // Sort newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRevisions(sorted)
      } catch (err: any) {
        console.error('[MyRevisionsPage] Fetch error:', err)
        setError(err.message || 'Failed to load revision history.')
      } finally {
        setLoading(false)
      }
    }

    loadRevisions()
  }, [token, user, authLoading])

  const toggleExpand = (id: string) => {
    setExpandedRevision(prev => (prev === id ? null : id))
  }

  // Get status badge styles
  const getStatusBadge = (status: CompanyRevision['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error/10 text-error">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        )
      case 'PartiallyApproved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
            <AlertTriangle className="w-3.5 h-3.5" /> Partially Approved
          </span>
        )
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 animate-pulse-slow">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        )
    }
  }

  // Helper to format field name to readable text
  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Loading Screen
  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-surface-500 dark:text-surface-400">Loading revision history...</p>
        </div>
      </div>
    )
  }

  // Guard Screen
  if (!user || !hasPermission(user, 'read:own-revisions')) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            You must be logged in as a Founder to view company revision requests.
          </p>
          <Link href="/login" className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 mb-10">
          <Link 
            href="/dashboard/my-companies" 
            className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors group self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Companies
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-2xl text-primary-600 dark:text-primary-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
                Revision History
              </h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                Track status and view decisions on your profile revision requests.
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex gap-3 text-error text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* History List */}
        {revisions.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No Requests Found</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto mb-6">
              You have not submitted any profile revision requests yet.
            </p>
            <Link 
              href="/dashboard/my-companies" 
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm"
            >
              Request a Revision
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {revisions.map((revision) => {
              const isExpanded = expandedRevision === revision.id
              const changeCount = Object.keys(revision.proposedChanges).length

              return (
                <div 
                  key={revision.id}
                  className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
                >
                  {/* Summary Card Header */}
                  <div 
                    onClick={() => toggleExpand(revision.id)}
                    className="p-6 sm:p-8 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-50/50 dark:hover:bg-surface-950/20 transition-colors select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-surface-900 dark:text-white">
                          Revision Request #{revision.id.slice(-6).toUpperCase()}
                        </span>
                        {getStatusBadge(revision.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
                        <span>Submitted on {formatDate(revision.createdAt)}</span>
                        <span>•</span>
                        <span>{changeCount} field change{changeCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="text-surface-400 hover:text-surface-600 dark:hover:text-white shrink-0 p-2 rounded-xl"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-950/10 space-y-6">
                      
                      {/* Overall Admin Note */}
                      {revision.adminNote && (
                        <div className="bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 rounded-2xl p-5 space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                            Administrator Note
                          </span>
                          <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                            {revision.adminNote}
                          </p>
                        </div>
                      )}

                      {/* Field Decisions Breakdown */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                          Proposed Changes & Decisions
                        </h4>

                        <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden bg-white dark:bg-surface-900 divide-y divide-surface-100 dark:divide-surface-800">
                          {Object.entries(revision.proposedChanges).map(([field, value]) => {
                            const decision = revision.fieldDecisions?.[field]
                            const fieldStatus = revision.status === 'Approved' ? 'approved' : (revision.status === 'Rejected' ? 'rejected' : (decision?.status || 'pending'))

                            return (
                              <div key={field} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1 max-w-xl">
                                  <span className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                                    {formatFieldName(field)}
                                  </span>
                                  <div className="text-sm font-medium text-surface-800 dark:text-surface-200">
                                    {typeof value === 'object' && value !== null ? (
                                      <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-950 p-3 rounded-lg overflow-x-auto border border-surface-100 dark:border-surface-800 max-h-40">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    ) : (
                                      String(value || '-')
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex flex-col items-end gap-1.5 self-start sm:self-center">
                                  {fieldStatus === 'approved' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                                      <CheckCircle2 className="w-4 h-4" /> Approved
                                    </span>
                                  ) : fieldStatus === 'rejected' ? (
                                    <div className="text-right">
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                                        <XCircle className="w-4 h-4" /> Rejected
                                      </span>
                                      {decision?.reason && (
                                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-xs leading-relaxed">
                                          {decision.reason}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-surface-500 dark:text-surface-400">
                                      <Clock className="w-4 h-4" /> Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Resubmit / Edit Details Button */}
                      {['Rejected', 'PartiallyApproved'].includes(revision.status) && revision.entityId && (
                        <div className="flex justify-end pt-2">
                          <Link
                            href={`/dashboard/my-companies/${revision.entityId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                            Resubmit / Edit Details
                          </Link>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

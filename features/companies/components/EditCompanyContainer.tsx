'use client'

import { useCompanyEditor } from '../hooks/useCompanyEditor'
import EditCompanyForm from './EditCompanyForm'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { hasPermission } from '@/lib/auth'

interface EditCompanyContainerProps {
  companyId: string
}

export default function EditCompanyContainer({ companyId }: EditCompanyContainerProps) {
  const editorProps = useCompanyEditor(companyId)

  // Loading State
  if (editorProps.authLoading || editorProps.loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-surface-500 dark:text-surface-400">Loading company details...</p>
        </div>
      </div>
    )
  }

  // Access Denied / Auth Error State
  if (!editorProps.user || !hasPermission(editorProps.user, 'read:own-managed-companies')) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            You must be logged in as a Founder to request edits for your company profile.
          </p>
          <Link href="/login" className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (editorProps.error && !editorProps.name) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Error</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{editorProps.error}</p>
          <Link href="/dashboard/my-companies" className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all">
            Back to My Companies
          </Link>
        </div>
      </div>
    )
  }

  return <EditCompanyForm {...editorProps} />
}

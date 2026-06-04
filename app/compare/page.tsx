import { fetchCompanies } from '@/lib/api'
import CompareTool from './CompareTool'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Companies',
  description: 'Compare startups and established companies side-by-side in Laos.',
}

export default async function ComparePage() {
  const allCompanies = await fetchCompanies()
  
  // Only allow comparing approved companies
  const approvedCompanies = allCompanies.filter(c => c.status === 'Approved')

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Compare <span className="gradient-text">Companies</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Evaluate metrics, funding, and team size side-by-side to make informed decisions about the Lao startup ecosystem.
          </p>
        </div>

        {/* Comparison Tool */}
        <CompareTool companies={approvedCompanies} />
        
      </div>
    </div>
  )
}

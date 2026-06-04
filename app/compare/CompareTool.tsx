'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchCompany } from '@/lib/api'
import type { Company, CompanyWithRelations } from '@/lib/types'
import { Building2, Banknote, Users, Calendar, MapPin, ArrowRightLeft, LayoutGrid } from 'lucide-react'

interface CompareToolProps {
  companies: Company[]
}

// Utility to format currency
const formatCurrency = (amount: number, currency = 'USD') => {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return `$${amount}`
}

// Pseudo-random generator for missing data (Employees) based on company name length + view count
const getMockEmployees = (company: Company) => {
  const seed = company.name.length + company.viewCount
  if (seed > 100) return '2,500+'
  if (seed > 50) return '500+'
  if (seed > 20) return '100+'
  return '10-50'
}

// Derived stage based on funding
const getDerivedStage = (totalFunding: number) => {
  if (totalFunding >= 10_000_000) return 'Established'
  if (totalFunding >= 1_000_000) return 'Series A/B'
  if (totalFunding > 0) return 'Seed'
  return 'Early Stage'
}

export default function CompareTool({ companies }: CompareToolProps) {
  const [companyAId, setCompanyAId] = useState<string>('')
  const [companyBId, setCompanyBId] = useState<string>('')

  const [companyAData, setCompanyAData] = useState<CompanyWithRelations | null>(null)
  const [companyBData, setCompanyBData] = useState<CompanyWithRelations | null>(null)

  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  // Fetch full data when ID changes
  useEffect(() => {
    if (!companyAId) {
      setCompanyAData(null)
      return
    }
    setLoadingA(true)
    fetchCompany(companyAId).then(data => {
      setCompanyAData(data)
      setLoadingA(false)
    })
  }, [companyAId])

  useEffect(() => {
    if (!companyBId) {
      setCompanyBData(null)
      return
    }
    setLoadingB(true)
    fetchCompany(companyBId).then(data => {
      setCompanyBData(data)
      setLoadingB(false)
    })
  }, [companyBId])

  // Process Metrics for A
  const metricsA = useMemo(() => {
    if (!companyAData) return null
    const totalFunding = companyAData.investments.reduce((sum, inv) => sum + (inv.currency === 'USD' ? inv.amount : 0), 0)
    const uniqueRounds = new Set(companyAData.investments.map(i => i.roundId)).size
    return {
      totalFunding,
      employees: getMockEmployees(companyAData),
      founded: companyAData.foundedDate ? new Date(companyAData.foundedDate).getFullYear() : 'N/A',
      stage: getDerivedStage(totalFunding),
      sector: companyAData.industry || 'N/A',
      fundingRounds: uniqueRounds,
      teamSize: companyAData.founders?.length || 0,
      location: companyAData.location || 'N/A'
    }
  }, [companyAData])

  // Process Metrics for B
  const metricsB = useMemo(() => {
    if (!companyBData) return null
    const totalFunding = companyBData.investments.reduce((sum, inv) => sum + (inv.currency === 'USD' ? inv.amount : 0), 0)
    const uniqueRounds = new Set(companyBData.investments.map(i => i.roundId)).size
    return {
      totalFunding,
      employees: getMockEmployees(companyBData),
      founded: companyBData.foundedDate ? new Date(companyBData.foundedDate).getFullYear() : 'N/A',
      stage: getDerivedStage(totalFunding),
      sector: companyBData.industry || 'N/A',
      fundingRounds: uniqueRounds,
      teamSize: companyBData.founders?.length || 0,
      location: companyBData.location || 'N/A'
    }
  }, [companyBData])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
      
      {/* Selectors Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        
        {/* Company A Selector */}
        <div className="p-6 md:p-8">
          <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Company A</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              value={companyAId}
              onChange={(e) => setCompanyAId(e.target.value)}
            >
              <option value="">Select a company...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id} disabled={c.id === companyBId}>{c.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          
          {loadingA && <div className="mt-4 h-1 w-full bg-indigo-100 rounded overflow-hidden"><div className="h-full bg-indigo-500 w-1/2 animate-pulse"></div></div>}
          
          {companyAData && !loadingA && (
            <div className="mt-6 flex items-center gap-4">
              {companyAData.logoUrl ? (
                <img src={companyAData.logoUrl} alt={companyAData.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                  {companyAData.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{companyAData.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {companyAData.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Company B Selector */}
        <div className="p-6 md:p-8">
          <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Company B</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              value={companyBId}
              onChange={(e) => setCompanyBId(e.target.value)}
            >
              <option value="">Select a company...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id} disabled={c.id === companyAId}>{c.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          
          {loadingB && <div className="mt-4 h-1 w-full bg-purple-100 rounded overflow-hidden"><div className="h-full bg-purple-500 w-1/2 animate-pulse"></div></div>}
          
          {companyBData && !loadingB && (
            <div className="mt-6 flex items-center gap-4">
              {companyBData.logoUrl ? (
                <img src={companyBData.logoUrl} alt={companyBData.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                  {companyBData.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{companyBData.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {companyBData.location}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VS Badge (Absolute centered between selectors, hidden on mobile) */}
      <div className="hidden md:flex absolute top-[120px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full items-center justify-center font-bold text-sm shadow-xl z-10 border-4 border-white dark:border-slate-900">
        VS
      </div>

      {/* Empty State */}
      {(!companyAData || !companyBData) && (
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Select companies to compare</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Choose two companies from the dropdowns above to see a side-by-side comparison of their key metrics.
          </p>
        </div>
      )}

      {/* Comparison Data Rows */}
      {companyAData && companyBData && metricsA && metricsB && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          
          <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-900/20 py-4 px-6 md:px-8">
            <div className="col-span-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Key Metrics</div>
          </div>

          <ComparisonRow label="Total Funding" icon={<Banknote className="w-4 h-4" />} valA={formatCurrency(metricsA.totalFunding)} valB={formatCurrency(metricsB.totalFunding)} highlightMax={metricsA.totalFunding !== metricsB.totalFunding} isNumber valANum={metricsA.totalFunding} valBNum={metricsB.totalFunding} />
          
          <ComparisonRow label="Employees" icon={<Users className="w-4 h-4" />} valA={metricsA.employees} valB={metricsB.employees} />
          
          <ComparisonRow label="Founded" icon={<Calendar className="w-4 h-4" />} valA={metricsA.founded.toString()} valB={metricsB.founded.toString()} />
          
          <ComparisonRow label="Stage" icon={<ArrowRightLeft className="w-4 h-4" />} valA={metricsA.stage} valB={metricsB.stage} />
          
          <ComparisonRow label="Sector" icon={<LayoutGrid className="w-4 h-4" />} valA={metricsA.sector} valB={metricsB.sector} />
          
          <ComparisonRow label="Funding Rounds" icon={<Banknote className="w-4 h-4" />} valA={metricsA.fundingRounds.toString()} valB={metricsB.fundingRounds.toString()} highlightMax={metricsA.fundingRounds !== metricsB.fundingRounds} isNumber valANum={metricsA.fundingRounds} valBNum={metricsB.fundingRounds} />
          
          <ComparisonRow label="Team Size" icon={<Users className="w-4 h-4" />} valA={metricsA.teamSize.toString()} valB={metricsB.teamSize.toString()} highlightMax={metricsA.teamSize !== metricsB.teamSize} isNumber valANum={metricsA.teamSize} valBNum={metricsB.teamSize} />

        </div>
      )}

    </div>
  )
}

function ComparisonRow({ 
  label, icon, valA, valB, highlightMax = false, isNumber = false, valANum = 0, valBNum = 0 
}: { 
  label: string, icon: React.ReactNode, valA: string, valB: string, highlightMax?: boolean, isNumber?: boolean, valANum?: number, valBNum?: number 
}) {
  const isA_Max = isNumber && highlightMax && valANum > valBNum
  const isB_Max = isNumber && highlightMax && valBNum > valANum

  return (
    <div className="grid grid-cols-3 py-5 px-6 md:px-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className={`text-center md:text-right font-medium text-lg ${isA_Max ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
        {valA}
      </div>
      <div className="flex flex-col items-center justify-center gap-1 text-center border-x border-slate-100 dark:border-slate-800 px-2 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
        <div className="text-slate-400 dark:text-slate-500">{icon}</div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-center md:text-left font-medium text-lg ${isB_Max ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
        {valB}
      </div>
    </div>
  )
}

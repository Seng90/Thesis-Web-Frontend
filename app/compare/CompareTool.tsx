'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { fetchCompany } from '@/lib/api'
import type { Company, CompanyWithRelations } from '@/lib/types'
import { Building2, Banknote, Users, Calendar, MapPin, ArrowRightLeft, LayoutGrid } from 'lucide-react'
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import CompanyLogo from '@/components/ui/CompanyLogo'

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
    
    let stage = 'Bootstrapped'
    if (companyAData.investments.length > 0) {
      const latest = [...companyAData.investments].sort((a, b) => new Date(b.investDate).getTime() - new Date(a.investDate).getTime())[0]
      stage = latest.round?.roundName || 'Undisclosed'
    }

    return {
      totalFunding,
      formattedFunding: totalFunding > 0 ? formatCurrency(totalFunding) : (companyAData.investments.length > 0 ? 'Undisclosed' : '$0'),
      founded: companyAData.foundedDate ? new Date(companyAData.foundedDate).getFullYear() : 'N/A',
      stage,
      sector: companyAData.industry || 'N/A',
      fundingRounds: uniqueRounds,
      teamSize: companyAData.founders?.length || 0,
      location: companyAData.location || 'N/A',
      viewCount: companyAData.viewCount || 0
    }
  }, [companyAData])

  // Process Metrics for B
  const metricsB = useMemo(() => {
    if (!companyBData) return null
    const totalFunding = companyBData.investments.reduce((sum, inv) => sum + (inv.currency === 'USD' ? inv.amount : 0), 0)
    const uniqueRounds = new Set(companyBData.investments.map(i => i.roundId)).size

    let stage = 'Bootstrapped'
    if (companyBData.investments.length > 0) {
      const latest = [...companyBData.investments].sort((a, b) => new Date(b.investDate).getTime() - new Date(a.investDate).getTime())[0]
      stage = latest.round?.roundName || 'Undisclosed'
    }

    return {
      totalFunding,
      formattedFunding: totalFunding > 0 ? formatCurrency(totalFunding) : (companyBData.investments.length > 0 ? 'Undisclosed' : '$0'),
      founded: companyBData.foundedDate ? new Date(companyBData.foundedDate).getFullYear() : 'N/A',
      stage,
      sector: companyBData.industry || 'N/A',
      fundingRounds: uniqueRounds,
      teamSize: companyBData.founders?.length || 0,
      location: companyBData.location || 'N/A',
      viewCount: companyBData.viewCount || 0
    }
  }, [companyBData])

  // Process Data for Radar Chart (Overall Comparison)
  const radarData = useMemo(() => {
    if (!metricsA || !metricsB || !companyAData || !companyBData) return []
    
    const normalize = (valA: number, valB: number) => {
      const max = Math.max(valA, valB, 1) // Prevent div by 0
      return { normA: (valA / max) * 100, normB: (valB / max) * 100 }
    }

    const funding = normalize(metricsA.totalFunding, metricsB.totalFunding)
    const team = normalize(metricsA.teamSize, metricsB.teamSize)
    const rounds = normalize(metricsA.fundingRounds, metricsB.fundingRounds)
    const popularity = normalize(metricsA.viewCount, metricsB.viewCount)

    return [
      { subject: 'Funding', [companyAData.name]: funding.normA, [companyBData.name]: funding.normB, fullMark: 100 },
      { subject: 'Rounds', [companyAData.name]: rounds.normA, [companyBData.name]: rounds.normB, fullMark: 100 },
      { subject: 'Team Size', [companyAData.name]: team.normA, [companyBData.name]: team.normB, fullMark: 100 },
      { subject: 'Popularity', [companyAData.name]: popularity.normA, [companyBData.name]: popularity.normB, fullMark: 100 },
    ]
  }, [metricsA, metricsB, companyAData, companyBData])

  // Process Data for Funding by Year
  const fundingByYearData = useMemo(() => {
    if (!companyAData || !companyBData) return []
    const yearsMap = new Map<number, { year: string, [key: string]: number | string }>()

    const processInvestments = (investments: typeof companyAData.investments, companyName: string) => {
      investments.forEach(inv => {
        if (!inv.investDate) return
        const year = new Date(inv.investDate).getFullYear()
        if (!yearsMap.has(year)) {
          yearsMap.set(year, { year: year.toString(), [companyAData.name]: 0, [companyBData.name]: 0 })
        }
        const data = yearsMap.get(year)!
        data[companyName] = ((data[companyName] as number) || 0) + (inv.currency === 'USD' ? inv.amount : 0)
      })
    }

    processInvestments(companyAData.investments, companyAData.name)
    processInvestments(companyBData.investments, companyBData.name)

    return Array.from(yearsMap.values())
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
      .map(item => {
        // Convert to Millions
        const formatted = { ...item }
        formatted[companyAData.name] = Number(((item[companyAData.name] as number) / 1_000_000).toFixed(2))
        formatted[companyBData.name] = Number(((item[companyBData.name] as number) / 1_000_000).toFixed(2))
        return formatted
      })
  }, [companyAData, companyBData])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
      
      {/* Selectors Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        
        {/* Company A Selector */}
        <div className="p-6 md:p-8">
          <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Company A</label>
          <div className="relative">
            <CompanySearchDropdown
              companies={companies}
              selectedId={companyAId}
              onSelect={setCompanyAId}
              disabledId={companyBId}
              placeholder="Select a company..."
            />
          </div>
          
          {loadingA && <div className="mt-4 h-1 w-full bg-indigo-100 rounded overflow-hidden"><div className="h-full bg-indigo-500 w-1/2 animate-pulse"></div></div>}
          
          {companyAData && !loadingA && (
            <div className="mt-6 flex items-center gap-4">
              <CompanyLogo logoUrl={companyAData.logoUrl} name={companyAData.name} size="lg" />
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
            <CompanySearchDropdown
              companies={companies}
              selectedId={companyBId}
              onSelect={setCompanyBId}
              disabledId={companyAId}
              placeholder="Select a company..."
            />
          </div>
          
          {loadingB && <div className="mt-4 h-1 w-full bg-purple-100 rounded overflow-hidden"><div className="h-full bg-purple-500 w-1/2 animate-pulse"></div></div>}
          
          {companyBData && !loadingB && (
            <div className="mt-6 flex items-center gap-4">
              <CompanyLogo logoUrl={companyBData.logoUrl} name={companyBData.name} size="lg" />
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

      {/* VS Badge */}
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

      {/* Comparison Data Rows & Charts */}
      {companyAData && companyBData && metricsA && metricsB && (
        <>
          {/* Metrics Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-900/20 py-4 px-6 md:px-8">
              <div className="col-span-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Key Metrics</div>
            </div>
            <ComparisonRow label="Total Funding" icon={<Banknote className="w-4 h-4" />} valA={metricsA.formattedFunding} valB={metricsB.formattedFunding} highlightMax={metricsA.totalFunding !== metricsB.totalFunding} isNumber valANum={metricsA.totalFunding} valBNum={metricsB.totalFunding} />
            <ComparisonRow label="Founded" icon={<Calendar className="w-4 h-4" />} valA={metricsA.founded.toString()} valB={metricsB.founded.toString()} />
            <ComparisonRow label="Stage" icon={<ArrowRightLeft className="w-4 h-4" />} valA={metricsA.stage} valB={metricsB.stage} />
            <ComparisonRow label="Sector" icon={<LayoutGrid className="w-4 h-4" />} valA={metricsA.sector} valB={metricsB.sector} />
            <ComparisonRow label="Funding Rounds" icon={<Banknote className="w-4 h-4" />} valA={metricsA.fundingRounds.toString()} valB={metricsB.fundingRounds.toString()} highlightMax={metricsA.fundingRounds !== metricsB.fundingRounds} isNumber valANum={metricsA.fundingRounds} valBNum={metricsB.fundingRounds} />
            <ComparisonRow label="Team Size" icon={<Users className="w-4 h-4" />} valA={metricsA.teamSize.toString()} valB={metricsB.teamSize.toString()} highlightMax={metricsA.teamSize !== metricsB.teamSize} isNumber valANum={metricsA.teamSize} valBNum={metricsB.teamSize} />
          </div>

          {/* Charts Section */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 md:p-10 space-y-12">
            
            {/* Overall Comparison (Radar) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h4 className="text-center font-bold text-slate-800 dark:text-slate-200 mb-6">Overall Comparison (Relative Score)</h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <RechartsTooltip wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 rounded-lg shadow-lg" />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Radar name={companyAData.name} dataKey={companyAData.name} stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    <Radar name={companyBData.name} dataKey={companyBData.name} stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funding by Year (Bar Chart) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h4 className="text-center font-bold text-slate-800 dark:text-slate-200 mb-6">Funding by Year ($M)</h4>
              {fundingByYearData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={fundingByYearData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val}M`} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                        wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 rounded-lg shadow-lg"
                        formatter={(value: any) => [`$${value}M`, undefined]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey={companyAData.name} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey={companyBData.name} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                  No funding data available to plot.
                </div>
              )}
            </div>

          </div>
        </>
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

function CompanySearchDropdown({
  companies,
  selectedId,
  onSelect,
  disabledId,
  placeholder = "Select a company..."
}: {
  companies: Company[]
  selectedId: string
  onSelect: (id: string) => void
  disabledId?: string
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  const selectedCompany = companies.find(c => c.id === selectedId)

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus-within:ring-2 focus-within:ring-indigo-500 font-medium transition-all cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCompany ? "" : "text-slate-500"}>
          {selectedCompany ? selectedCompany.name : placeholder}
        </span>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div className="sticky top-0 p-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
              placeholder="Search companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="py-1">
            {filteredCompanies.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No companies found</div>
            ) : (
              filteredCompanies.map(c => {
                const isDisabled = c.id === disabledId
                return (
                  <div
                    key={c.id}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      isDisabled 
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' 
                        : c.id === selectedId
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDisabled) {
                        onSelect(c.id)
                        setIsOpen(false)
                        setQuery('')
                      }
                    }}
                  >
                    {c.name}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

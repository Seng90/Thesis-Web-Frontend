'use client'

import { useState, useEffect } from 'react'
import { fetchInvestors, fetchInvestments } from '@/lib/api'
import type { Investor } from '@/lib/types'
import SearchBar from '@/components/ui/SearchBar'
import InvestorCard from '@/components/cards/InvestorCard'
import { Users, Briefcase } from 'lucide-react'

const types = [
  'All',
  'Venture Capital',
  'Angel Investor',
  'Private Equity',
  'Corporate',
  'Government'
]

export default function InvestorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [allInvestors, setAllInvestors] = useState<Investor[]>([])
  const [uniquePortfolioCompanies, setUniquePortfolioCompanies] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [investors, investments] = await Promise.all([
          fetchInvestors(),
          fetchInvestments(),
        ])
        setAllInvestors(investors)
        setUniquePortfolioCompanies(new Set(investments.map(i => i.companyId)).size)
      } catch {
        // fallback: empty
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredInvestors = allInvestors.filter((investor) => {
    const matchesSearch = investor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType =
      activeFilter === 'All' || investor.type === activeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="animate-fade-in">
      {/* Hero Banner — dark navy matching Companies page */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #172645 0%, #1e3a5f 50%, #172645 100%)' }}>
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-blue-400/5 blur-[80px]"></div>
          <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[60%] rounded-full bg-purple-400/5 blur-[60px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          {/* Tagline */}
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-200 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Meet the Investors Funding Lao Startups
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
            Investors
          </h1>
          <p className="text-sm sm:text-base text-blue-100/80 max-w-xl mx-auto leading-relaxed mb-8">
            Discover active investors, venture capital firms, and angel networks funding the Lao startup ecosystem.
          </p>

          {/* Stat Cards — frosted glass inside banner */}
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3.5 flex items-center gap-3 hover:bg-white/15 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white leading-tight">{isLoading ? '—' : allInvestors.length}</p>
                  <p className="text-[11px] text-blue-200/70 font-medium">Total Investors</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3.5 flex items-center gap-3 hover:bg-white/15 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-200" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white leading-tight">{isLoading ? '—' : uniquePortfolioCompanies}</p>
                  <p className="text-[11px] text-blue-200/70 font-medium">Portfolio Companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 max-w-md">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Search investors by name..." 
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-slate-500 mb-6">
            Showing <span className="font-semibold text-slate-700">{filteredInvestors.length}</span> results
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 h-64 rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : filteredInvestors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => (
              <InvestorCard key={investor.id} investor={investor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No investors found</h3>
            <p className="text-slate-500">
              We couldn&apos;t find any investors matching your search criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('All')
              }}
              className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

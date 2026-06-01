'use client'

import { useState, useEffect } from 'react'
import { fetchCompanies, fetchInvestments } from '@/lib/api'
import type { Company, Investment } from '@/lib/types'
import SearchBar from '@/components/ui/SearchBar'
import CompanyCard from '@/components/cards/CompanyCard'
import { Building2, Banknote } from 'lucide-react'

const industries = [
  'All',
  'FinTech',
  'AgriTech',
  'EdTech',
  'HealthTech',
  'Logistics',
  'Tourism Tech',
  'E-Commerce',
  'SaaS',
]

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [totalFundedUSD, setTotalFundedUSD] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [companies, investments] = await Promise.all([
          fetchCompanies(),
          fetchInvestments(),
        ])
        setAllCompanies(companies)
        setTotalFundedUSD(
          investments
            .filter((i) => i.currency === 'USD')
            .reduce((sum, i) => sum + i.amount, 0)
        )
      } catch {
        // fallback: empty
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const approvedCompanies = allCompanies.filter(c => c.status === 'Approved')

  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesIndustry =
      activeFilter === 'All' || company.industry === activeFilter
    return matchesSearch && matchesIndustry
  })

  return (
    <div className="animate-fade-in">
      {/* Hero Banner — dark navy #172645 */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #172645 0%, #1e3a5f 50%, #172645 100%)' }}>
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-blue-400/5 blur-[80px]"></div>
          <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-400/5 blur-[60px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          {/* Tagline */}
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-200 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Explore the Lao Business Ecosystem
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
            Companies
          </h1>
          <p className="text-sm sm:text-base text-blue-100/80 max-w-xl mx-auto leading-relaxed mb-8">
            Discover and track startups and established companies across Laos. Filter by industry or search by name.
          </p>

          {/* Stat Cards — frosted glass inside banner */}
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3.5 flex items-center gap-3 hover:bg-white/15 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-200" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white leading-tight">{isLoading ? '—' : approvedCompanies.length}</p>
                  <p className="text-[11px] text-blue-200/70 font-medium">Total Companies</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3.5 flex items-center gap-3 hover:bg-white/15 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white leading-tight">{isLoading ? '—' : `$${totalFundedUSD.toLocaleString()}`}</p>
                  <p className="text-[11px] text-blue-200/70 font-medium">Total Funded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 max-w-md">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Search companies by name..." 
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setActiveFilter(industry)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === industry
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-slate-500 mb-6">
            Showing <span className="font-semibold text-slate-700">{filteredCompanies.length}</span> results
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 h-64 rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-500">
              We couldn&apos;t find any companies matching your search criteria. Try adjusting your filters.
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

/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { fetchStats, fetchFeaturedCompanies, fetchTopIndustries } from '@/features/analytics/api/statsApi'
import { fetchRecentInvestments } from '@/features/investors/api/investorsApi'
import type { Company, InvestmentFull } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import CompanyCard from '@/components/cards/CompanyCard'
import { formatDate } from '@/lib/utils'
import { Building2, Users, TrendingUp, Banknote, Search, Rocket, ArrowRight, BriefcaseBusiness } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalInvestors: 0,
    totalFundingRounds: 0,
    totalFundingUSD: 0
  })
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([])
  const [topIndustries, setTopIndustries] = useState<string[]>([])
  const [recentInvestments, setRecentInvestments] = useState<InvestmentFull[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [apiStats, apiFeatured, apiIndustries, apiInvestments] = await Promise.all([
          fetchStats(),
          fetchFeaturedCompanies(9),
          fetchTopIndustries(6),
          fetchRecentInvestments(6),
        ])
        setStats(apiStats)
        if (apiFeatured.length > 0) setFeaturedCompanies(apiFeatured)
        setTopIndustries(apiIndustries)
        setRecentInvestments(apiInvestments)
      } catch {
        console.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/companies')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      <section className="relative bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/70 to-slate-950" />

        {/* Hero Content */}
        <div className="relative z-10 pt-20 pb-10 lg:pt-28 lg:pb-14">
          <div className="max-w-5xl mx-auto text-center px-4 animate-slide-up">
            {/* Tagline above heading */}
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-100 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Discover Lao Businesses
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              The Investment Tracking{' '}
              <br className="hidden sm:block" />
              Platform for{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">Laos</span>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-amber-400/60 via-yellow-300/80 to-amber-400/60 rounded-full blur-[1px]"></span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-indigo-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track companies, investors, and funding rounds across Laos. Your gateway to the rapidly growing Lao startup world.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-white/20 to-amber-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>
                <div className="relative flex items-center bg-white/95 dark:bg-surface-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-indigo-900/30 dark:shadow-indigo-500/10">
                  <div className="pl-5">
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies, industries, or investors..."
                    className="flex-1 px-4 py-4.5 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base outline-none min-w-0"
                    id="hero-search"
                  />
                  <button
                    type="submit"
                    className="mr-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 shrink-0"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Stats Row — white bg strip within the gradient section */}
        <div className="relative z-10 mt-6">
          <div className="bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Stat 1 — Companies */}
                <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-800 border border-slate-100 dark:border-surface-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white ${isLoading ? 'animate-pulse' : ''}`}>{stats.totalCompanies}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Total Companies</p>
                  </div>
                </div>

                {/* Stat 2 — Investors */}
                <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-800 border border-slate-100 dark:border-surface-700 hover:shadow-md hover:border-purple-100 dark:hover:border-purple-500/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white ${isLoading ? 'animate-pulse' : ''}`}>{stats.totalInvestors}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Total Investors</p>
                  </div>
                </div>

                {/* Stat 3 — Funding Rounds */}
                <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-800 border border-slate-100 dark:border-surface-700 hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-500/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white ${isLoading ? 'animate-pulse' : ''}`}>{stats.totalFundingRounds}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Funding Rounds</p>
                  </div>
                </div>

                {/* Stat 4 — Total Funding */}
                <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-800 border border-slate-100 dark:border-surface-700 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-500/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate ${isLoading ? 'animate-pulse' : ''}`}>
                      ${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(stats.totalFundingUSD)}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">Total Funding</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Startups</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover the most viewed and trending startups building innovative solutions in Laos.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-surface-800 h-64 rounded-2xl border border-slate-200 dark:border-surface-700"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            href="/companies"
            className="inline-flex items-center text-indigo-600 font-semibold text-lg hover:text-indigo-700 hover:underline transition-all"
          >
            View All Companies <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Explore by Industry Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-50/50 dark:bg-surface-900/30 rounded-3xl mb-24 border border-slate-200/50 dark:border-surface-700/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Explore by Industry</h2>
          <p className="text-slate-600 dark:text-slate-400">Find startups in the most active sectors</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-surface-800 h-32 rounded-2xl border border-slate-200 dark:border-surface-700"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topIndustries.map((ind) => (
              <Link key={ind} href={`/companies?q=${encodeURIComponent(ind)}`} className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-surface-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <BriefcaseBusiness className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white text-center line-clamp-1">{ind}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Funding Rounds Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Recent Funding Rounds</h2>
            <p className="text-slate-600 dark:text-slate-400">The latest investments shaping the ecosystem</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-surface-800 h-20 rounded-2xl border border-slate-200 dark:border-surface-700"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-surface-700">
              <div className="col-span-2">Company</div>
              <div>Amount</div>
              <div>Round</div>
              <div>Investor & Date</div>
            </div>
            
            {/* List Items */}
            {recentInvestments.map((inv) => (
              <div key={inv.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start md:items-center bg-white dark:bg-surface-800 p-4 md:px-6 md:py-4 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm hover:shadow-md transition-all group">
                {/* Company */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-surface-700 flex items-center justify-center overflow-hidden shrink-0">
                    {inv.company?.logoUrl ? (
                      <img src={inv.company.logoUrl} alt={inv.company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <Link href={`/companies/${inv.companyId}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1">
                      {inv.company?.name || 'Unknown Company'}
                    </Link>
                  </div>
                </div>
                
                {/* Amount */}
                <div>
                  <p className="text-xs md:hidden text-slate-500 dark:text-slate-400 mb-1">Amount</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {inv.currency} {Intl.NumberFormat('en-US', { notation: 'compact' }).format(inv.amount)}
                  </p>
                </div>
                
                {/* Round */}
                <div>
                  <p className="text-xs md:hidden text-slate-500 dark:text-slate-400 mb-1">Round</p>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full inline-block">
                    {inv.round?.roundName || 'Investment'}
                  </span>
                </div>
                
                {/* Investor & Date */}
                <div>
                  <p className="text-xs md:hidden text-slate-500 dark:text-slate-400 mb-1">Investor & Date</p>
                  <div className="flex flex-col">
                    {inv.investor ? (
                      <Link href={`/investors/${inv.investorId}`} className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1">
                        {inv.investor.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {inv.customInvestorName || '-'}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatDate(inv.investDate, '-')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-surface-900 border-y border-slate-200/60 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm dark:shadow-none">
                <Search className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Search & Filter</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Find companies and investors by industry, funding stage, or location using our advanced search tools.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm dark:shadow-none">
                <Rocket className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Discover Insights</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Access deep data on funding rounds, team members, and portfolio companies to understand market trends.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm dark:shadow-none">
                <Users className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Connect & Grow</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Reach out directly to founders and investors to build partnerships or explore investment opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Explore Laos&apos; Startup Ecosystem?
            </h2>
            <p className="text-xl text-indigo-100/80 mb-10 max-w-2xl mx-auto">
              Join thousands of entrepreneurs, investors, and enthusiasts. Create your free account today to get started.
            </p>
            <Link 
              href="/signup"
              className="inline-flex px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}

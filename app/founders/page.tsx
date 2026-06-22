'use client'

import { useState, useEffect } from 'react'
import { fetchFounders } from '@/lib/api'
import type { Founder } from '@/lib/types'
import SearchBar from '@/components/ui/SearchBar'
import FounderCard from '@/components/cards/FounderCard'
import { Users } from 'lucide-react'

export default function FoundersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [allFounders, setAllFounders] = useState<Founder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const founders = await fetchFounders()
        setAllFounders(founders)
      } catch {
        // fallback: empty
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredFounders = allFounders.filter((founder) => {
    const q = searchQuery.toLowerCase()
    return founder.nameEn.toLowerCase().includes(q) || founder.nameLa.toLowerCase().includes(q)
  })

  return (
    <div className="animate-fade-in">
      {/* Hero Banner — dark navy matching Companies/Investors page */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b1745 0%, #3e1e5f 50%, #2b1745 100%)' }}>
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-purple-400/10 blur-[80px]"></div>
          <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[60%] rounded-full bg-pink-400/5 blur-[60px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          {/* Tagline */}
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-purple-200 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Meet the Visionaries Building Lao Startups
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
            Founders
          </h1>
          <p className="text-sm sm:text-base text-purple-100/80 max-w-xl mx-auto leading-relaxed mb-8">
            Discover the founders, CEOs, and key executives driving innovation and growth in the Lao startup ecosystem.
          </p>

          {/* Stat Cards — frosted glass inside banner */}
          <div className="max-w-xs mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3.5 flex items-center justify-center gap-3 hover:bg-white/15 transition-colors duration-300">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white leading-tight">{isLoading ? '—' : allFounders.length}</p>
                <p className="text-[11px] text-purple-200/70 font-medium">Total Founders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-end">
            <div className="flex-1 max-w-md w-full">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Search founders by name..." 
              />
            </div>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredFounders.length}</span> results
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-surface-800 h-28 rounded-2xl border border-slate-200 dark:border-surface-700"></div>
            ))}
          </div>
        ) : filteredFounders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFounders.map((founder) => (
              <FounderCard key={founder.id} founder={founder as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-surface-800/50 rounded-3xl border border-slate-200 border-dashed dark:border-surface-700">
            <div className="w-16 h-16 bg-slate-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No founders found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't find any founders matching "{searchQuery}".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { FundraisingPost } from '@/lib/types'
import RaiseCard from '@/components/cards/RaiseCard'

export default function RaisesClient({ posts }: { posts: FundraisingPost[] }) {
  const [q, setQ] = useState('')

  const filtered = posts.filter((p) => {
    if (!q) return true
    const s = q.toLowerCase()
    return (
      p.title.toLowerCase().includes(s) ||
      p.companyName.toLowerCase().includes(s) ||
      p.tags.some((t) => t.toLowerCase().includes(s))
    )
  })

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-purple-950/20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end animate-slide-up">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                Founder Stories
              </span>
              <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl tracking-tight">
                Fundraising Posts
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Discover Lao founders raising their next round. Get the story
                behind each round straight from the people building it.
              </p>
            </div>
            
            <Link
              href="/raises/new"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <Plus className="h-5 w-5" />
              Post a Raise
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="relative mb-10 max-w-md animate-fade-in">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900 shadow-sm transition-all"
            placeholder="Search by title, company, or tag..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Posts Grid */}
        <div className="animate-fade-in">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center bg-white/50 dark:bg-slate-900/50">
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                {posts.length === 0
                  ? "No fundraising posts yet. Founders, be the first to share your round!"
                  : "No posts match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <RaiseCard key={p.slug} post={p} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

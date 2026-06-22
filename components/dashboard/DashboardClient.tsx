'use client'

import { DollarSign, Building2, Users, TrendingUp, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Link from 'next/link'

interface DashboardClientProps {
  stats: {
    totalFunding: number
    companiesTracked: number
    activeInvestors: number
    fundingRounds: number
  }
  fundingOverTime: { year: string; total: number }[]
  sectorDistribution: { name: string; value: number }[]
  topInvestors: { id: string; name: string; type: string; laoDeals: number; laoFunded: number; location: string }[]
}

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
]

export default function DashboardClient({ stats, fundingOverTime, sectorDistribution, topInvestors }: DashboardClientProps) {
  const statCards = [
    { label: 'Total Funding', value: `$${stats.totalFunding.toFixed(1)}M`, icon: DollarSign, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { label: 'Companies Tracked', value: stats.companiesTracked.toString(), icon: Building2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
    { label: 'Active Investors', value: stats.activeInvestors.toString(), icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
    { label: 'Funding Rounds', value: stats.fundingRounds.toString(), icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {s.value}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funding Over Time */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
            Cumulative Funding Over Time
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={fundingOverTime}>
                <defs>
                  <linearGradient id="gradFunding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 rounded-lg shadow-lg"
                  formatter={(value: any) => [`$${value.toFixed(1)}M`, 'Total Funding']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="url(#gradFunding)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
            Funding by Sector
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  stroke="none"
                >
                  {sectorDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 rounded-lg shadow-lg"
                  formatter={(value: any) => [`$${value.toFixed(1)}M`, 'Funding']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Top Investors in Laos
          </h2>
          <Link
            href="/investors"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-4 pr-4 font-semibold">#</th>
                <th className="pb-4 pr-4 font-semibold">Investor</th>
                <th className="pb-4 pr-4 font-semibold">Type</th>
                <th className="pb-4 pr-4 font-semibold text-right">Deals</th>
                <th className="pb-4 font-semibold text-right">Funding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topInvestors.map((inv, i) => (
                <tr key={inv.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 pr-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {i + 1}
                  </td>
                  <td className="py-4 pr-4">
                    <Link
                      href={`/investors/${inv.id}`}
                      className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {inv.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {inv.location}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-semibold text-slate-900 dark:text-white">
                    {inv.laoDeals}
                  </td>
                  <td className="py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    ${inv.laoFunded}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

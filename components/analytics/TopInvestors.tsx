'use client'

import { useMemo } from 'react'
import { InvestmentWithDetails } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Building2, Landmark, Trophy } from 'lucide-react'

export default function TopInvestors({ investments }: { investments: InvestmentWithDetails[] }) {
  const topInvestors = useMemo(() => {
    const investorData: Record<string, { name: string, amount: number, type: string, count: number }> = {}

    investments.forEach((inv) => {
      const name = inv.investor?.name || inv.customInvestorName || 'Unknown Investor'
      const type = inv.investor?.type || 'Unknown Type'
      
      if (!investorData[name]) {
        investorData[name] = { name, amount: 0, type, count: 0 }
      }
      investorData[name].amount += (inv.amount || 0)
      investorData[name].count += 1
    })

    return Object.values(investorData)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Show top 5
  }, [investments])

  if (topInvestors.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
        No investor data available.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1">
        {topInvestors.map((investor, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-surface-700/30 border border-slate-100 dark:border-surface-700 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-600/50 dark:text-slate-300' :
                index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
              }`}>
                {index < 3 ? <Trophy className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{investor.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Landmark className="w-3 h-3" />
                    {investor.type}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">&bull;</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{investor.count} {investor.count === 1 ? 'Round' : 'Rounds'}</span>
                </div>
              </div>
            </div>
            <div className="text-right ml-4 shrink-0">
              <p className="font-bold text-slate-900 dark:text-white">
                {investor.amount > 0 ? formatCurrency(investor.amount) : 'Undisclosed'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

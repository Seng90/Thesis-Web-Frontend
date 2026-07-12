'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronDown, ChevronRight, Banknote, User, Tag, ExternalLink } from 'lucide-react'
import type { InvestmentWithDetails } from '@/lib/types'

interface GroupedInvestment {
  roundId: string
  roundName: string
  roundDescription: string | null
  totalAmount: number
  currency: string
  investDate: string
  investors: {
    id: string
    investorId: string | null
    name: string
    type: string | null
    amount: number
    investDate: string
    referenceUrl?: string | null
  }[]
}

export default function FundingHistoryTable({ investments }: { investments: InvestmentWithDetails[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (investments.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 text-sm">No public funding data available.</p>
  }

  // Group investments by roundId
  const groupedInvestmentsMap = investments.reduce((acc, inv) => {
    if (!acc[inv.roundId]) {
      acc[inv.roundId] = {
        roundId: inv.roundId,
        roundName: inv.round.roundName,
        roundDescription: inv.round.description,
        totalAmount: 0,
        currency: inv.currency,
        investDate: inv.investDate,
        investors: [],
      }
    }
    
    acc[inv.roundId].totalAmount += inv.amount
    
    if (new Date(inv.investDate) < new Date(acc[inv.roundId].investDate)) {
      acc[inv.roundId].investDate = inv.investDate
    }

    acc[inv.roundId].investors.push({
      id: inv.id,
      investorId: inv.investorId,
      name: inv.investor ? inv.investor.name : (inv.customInvestorName || 'Undisclosed Investor'),
      type: inv.investor ? inv.investor.type : null,
      amount: inv.amount,
      investDate: inv.investDate,
      referenceUrl: inv.referenceUrl,
    })

    return acc
  }, {} as Record<string, GroupedInvestment>)

  const groupedInvestments = Object.values(groupedInvestmentsMap).sort((a, b) => 
    new Date(b.investDate).getTime() - new Date(a.investDate).getTime()
  )

  return (
    <div className="space-y-3">
      {groupedInvestments.map(group => {
        const isExpanded = expandedId === group.roundId
        return (
          <div key={group.roundId} className="rounded-2xl border border-slate-100 dark:border-surface-700 overflow-hidden transition-all">
            {/* Summary Row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : group.roundId)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-surface-900/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{group.roundName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(group.investDate)} &middot; {group.investors.length} Investor{group.investors.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{group.totalAmount > 0 ? formatCurrency(group.totalAmount, group.currency) : 'Undisclosed'}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 transition-transform" />
                )}
              </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-surface-700 bg-slate-50/30 dark:bg-surface-900/30 animate-fade-in">
                <div className="pt-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Round Details</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{group.roundName}</p>
                      {group.roundDescription && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{group.roundDescription}</p>}
                    </div>
                  </div>
                </div>
                
                <h5 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Participating Investors</h5>
                
                <div className="space-y-3">
                  {group.investors.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-slate-100 dark:border-surface-700 shadow-sm">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          {inv.investorId ? (
                            <Link href={`/investors/${inv.investorId}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                              {inv.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{inv.name}</span>
                          )}
                          {inv.type && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{inv.type}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {inv.amount > 0 ? formatCurrency(inv.amount, group.currency) : 'Undisclosed'}
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(inv.investDate)}</p>
                          {inv.referenceUrl && (
                            <a href={inv.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600" title="Reference Link">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

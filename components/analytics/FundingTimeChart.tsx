'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { InvestmentWithDetails } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default function FundingTimeChart({ investments }: { investments: InvestmentWithDetails[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const data = useMemo(() => {
    const yearlyData: Record<string, number> = {}

    investments.forEach((inv) => {
      if (!inv.investDate) return
      const year = new Date(inv.investDate).getFullYear().toString()
      yearlyData[year] = (yearlyData[year] || 0) + (inv.amount || 0)
    })

    return Object.entries(yearlyData)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
  }, [investments])

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
        No funding data available.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-surface-700" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9', className: 'dark:fill-surface-700/50' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#0f172a'
              }}
              formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Raised']}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Bar 
              dataKey="amount" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

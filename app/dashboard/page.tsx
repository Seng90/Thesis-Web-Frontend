import DashboardClient from '@/components/dashboard/DashboardClient'
import { fundingOverTimeData, sectorDistributionData, topInvestorsMock } from '@/lib/dashboard-mock'
import { fetchStats } from '@/features/analytics/api/statsApi'
import { fetchInvestments } from '@/features/investors/api/investorsApi'
import PremiumGuard from '@/components/auth/PremiumGuard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ecosystem Dashboard',
  description: 'Real-time analytics of the Lao investment ecosystem.',
}

export default async function DashboardPage() {
  let stats = {
    totalFunding: 12.4, // Fallback mock in millions
    companiesTracked: 45,
    activeInvestors: 18,
    fundingRounds: 24
  }

  let topInvestors = topInvestorsMock
  let fundingOverTime = fundingOverTimeData
  let sectorDistribution = sectorDistributionData

  try {
    const apiStats = await fetchStats()
    stats = {
      totalFunding: apiStats.totalFundingUSD / 1000000,
      companiesTracked: apiStats.totalCompanies,
      activeInvestors: apiStats.totalInvestors,
      fundingRounds: apiStats.totalFundingRounds
    }

    // Fetch real investments for charts & leaderboard
    const investments = await fetchInvestments()

    // 1. Calculate topInvestors dynamically
    const investorGroups: Record<string, {
      id: string
      name: string
      type: string
      laoDeals: number
      laoFunded: number
      location: string
    }> = {}

    investments.forEach((inv) => {
      if (inv.status === 'Approved' && inv.investorId && inv.investor) {
        const id = inv.investorId
        if (!investorGroups[id]) {
          investorGroups[id] = {
            id,
            name: inv.investor.name,
            type: inv.investor.type || 'Unknown',
            laoDeals: 0,
            laoFunded: 0,
            location: 'Laos'
          }
        }
        investorGroups[id].laoDeals += 1
        if (inv.currency === 'USD') {
          investorGroups[id].laoFunded += inv.amount
        }
      }
    })

    const calculatedTopInvestors = Object.values(investorGroups)
      .map(group => ({
        ...group,
        laoFunded: Number((group.laoFunded / 1000000).toFixed(1))
      }))
      .sort((a, b) => b.laoFunded - a.laoFunded || b.laoDeals - a.laoDeals)
      .slice(0, 5)

    if (calculatedTopInvestors.length > 0) {
      topInvestors = calculatedTopInvestors
    }

    // 2. Calculate fundingOverTime dynamically
    const yearFunding: Record<string, number> = {}
    investments.forEach((inv) => {
      if (inv.status === 'Approved' && inv.investDate && inv.currency === 'USD') {
        const year = new Date(inv.investDate).getFullYear().toString()
        if (!isNaN(Number(year))) {
          yearFunding[year] = (yearFunding[year] || 0) + (inv.amount / 1000000)
        }
      }
    })

    const sortedYears = Object.keys(yearFunding).sort()
    let cumulative = 0
    const calculatedFundingOverTime: { year: string; total: number }[] = []
    for (const year of sortedYears) {
      cumulative += yearFunding[year]
      calculatedFundingOverTime.push({
        year,
        total: Number(cumulative.toFixed(1))
      })
    }

    if (calculatedFundingOverTime.length > 0) {
      fundingOverTime = calculatedFundingOverTime
    }

    // 3. Calculate sectorDistribution dynamically
    const sectorFunding: Record<string, number> = {}
    investments.forEach((inv) => {
      if (inv.status === 'Approved' && inv.company?.industry && inv.currency === 'USD') {
        const sector = inv.company.industry
        sectorFunding[sector] = (sectorFunding[sector] || 0) + (inv.amount / 1000000)
      }
    })

    const calculatedSectorDistribution = Object.entries(sectorFunding)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(1))
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    if (calculatedSectorDistribution.length > 0) {
      sectorDistribution = calculatedSectorDistribution
    }

  } catch (error) {
    console.error('Failed to load real stats for dashboard', error)
  }

  return (
    <PremiumGuard>
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ecosystem Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
            Real-time analytics and insights of the Lao investment ecosystem.
          </p>
        </div>

        {/* Dashboard Content */}
        <DashboardClient 
          stats={stats}
          fundingOverTime={fundingOverTime}
          sectorDistribution={sectorDistribution}
          topInvestors={topInvestors}
        />
        
        </div>
      </div>
    </PremiumGuard>
  )
}

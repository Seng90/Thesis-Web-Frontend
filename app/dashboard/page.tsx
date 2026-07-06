import DashboardClient from '@/components/dashboard/DashboardClient'
import { fundingOverTimeData, sectorDistributionData, topInvestorsMock } from '@/lib/dashboard-mock'
import { fetchStats } from '@/features/analytics/api/statsApi'
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

  try {
    const apiStats = await fetchStats()
    stats = {
      totalFunding: apiStats.totalFundingUSD / 1000000,
      companiesTracked: apiStats.totalCompanies,
      activeInvestors: apiStats.totalInvestors,
      fundingRounds: apiStats.totalFundingRounds
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
          fundingOverTime={fundingOverTimeData}
          sectorDistribution={sectorDistributionData}
          topInvestors={topInvestorsMock}
        />
        
        </div>
      </div>
    </PremiumGuard>
  )
}

import { fetchCompanies } from '@/features/companies/api/companiesApi'
import { fetchInvestors, fetchInvestments } from '@/features/investors/api/investorsApi'
import { fetchFundingRounds } from '@/features/raises/api/raisesApi'
import type { Company } from '@/lib/types'

export async function fetchTopIndustries(limit: number = 6): Promise<string[]> {
  const companies = await fetchCompanies()
  const approved = companies.filter(c => c.status === 'Approved')
  
  const industryCounts: Record<string, number> = {}
  approved.forEach(c => {
    if (c.industry) {
      industryCounts[c.industry] = (industryCounts[c.industry] || 0) + 1
    }
  })
  
  return Object.entries(industryCounts)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0])
}

export async function fetchStats(): Promise<{
  totalCompanies: number
  totalInvestors: number
  totalFundingRounds: number
  totalFundingUSD: number
}> {
  const [companies, investors, investments, fundingRounds] = await Promise.all([
    fetchCompanies(),
    fetchInvestors(),
    fetchInvestments(),
    fetchFundingRounds(),
  ])

  const totalFundingUSD = investments
    .filter((i) => i.currency === 'USD')
    .reduce((sum, i) => sum + i.amount, 0)

  return {
    totalCompanies: companies.filter((c) => c.status === 'Approved').length,
    totalInvestors: investors.length,
    totalFundingRounds: fundingRounds.length,
    totalFundingUSD,
  }
}

export async function fetchFeaturedCompanies(limit: number = 3): Promise<Company[]> {
  const companies = await fetchCompanies()
  return companies
    .filter((c) => c.status === 'Approved')
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit)
}

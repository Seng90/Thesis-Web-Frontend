import { apiFetch, API_BASE } from '@/lib/apiClient'
import { mapInvestor, mapInvestorWithPortfolio, mapInvestmentWithDetails, mapInvestmentFull } from '@/lib/mappers'
import type { Investor, InvestorWithPortfolio, InvestmentWithDetails, InvestmentFull } from '@/lib/types'

export async function fetchInvestors(): Promise<Investor[]> {
  const data = await apiFetch<unknown[]>('/user/investors')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapInvestor)
}

export async function fetchInvestor(id: string): Promise<InvestorWithPortfolio | null> {
  const data = await apiFetch<unknown>(`/user/investors/${id}`)
  if (!data) return null
  return mapInvestorWithPortfolio(data)
}

export async function fetchInvestments(): Promise<InvestmentWithDetails[]> {
  try {
    const res = await fetch(`${API_BASE}/user/investments`, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.error('[fetchInvestments] Failed to fetch investments', res.status)
      return []
    }
    const text = await res.text()
    if (!text) return []
    const data = JSON.parse(text)
    if (!Array.isArray(data)) return []
    return data.map(mapInvestmentWithDetails)
  } catch (e) {
    console.error('[fetchInvestments] Error parsing/fetching investments', e)
    return []
  }
}

export async function fetchRecentInvestments(limit: number = 6): Promise<InvestmentFull[]> {
  try {
    const res = await fetch(`${API_BASE}/user/investments`, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.error('[fetchRecentInvestments] Failed to fetch investments', res.status)
      return []
    }
    const text = await res.text()
    if (!text) return []
    const data = JSON.parse(text)
    if (!Array.isArray(data)) return []
    const investments = data.map(mapInvestmentFull)
    return investments
      .sort((a, b) => {
        const timeA = a.investDate ? new Date(a.investDate).getTime() : 0
        const timeB = b.investDate ? new Date(b.investDate).getTime() : 0
        const valA = isNaN(timeA) ? 0 : timeA
        const valB = isNaN(timeB) ? 0 : timeB
        return valB - valA
      })
      .slice(0, limit)
  } catch (e) {
    console.error('[fetchRecentInvestments] Error parsing/fetching investments', e)
    return []
  }
}

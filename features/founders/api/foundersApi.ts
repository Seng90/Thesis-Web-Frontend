import { apiFetch } from '@/lib/apiClient'
import { mapFounder, mapCompany } from '@/lib/mappers'
import type { Founder, Company } from '@/lib/types'

export async function fetchFounders(): Promise<Founder[]> {
  const data = await apiFetch<unknown[]>('/user/founders')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFounder)
}

export async function fetchFounder(id: string): Promise<Founder | null> {
  const data = await apiFetch<unknown>(`/user/founders/${id}`)
  if (!data) return null
  return mapFounder(data)
}

export async function fetchFounderCompanies(founderId: string): Promise<Company[]> {
  const data = await apiFetch<unknown[]>(`/user/founders/${founderId}/companies`)
  if (!data || !Array.isArray(data)) return []
  return data.map(mapCompany)
}

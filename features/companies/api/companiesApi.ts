import { apiFetch, authFetch, API_BASE } from '@/lib/apiClient'
import { mapCompany, mapCompanyWithRelations, mapCompanyRevision } from '@/lib/mappers'
import type {
  Company,
  CompanyWithRelations,
  Founder,
  FounderWithRole,
  FundingRound,
  Investment,
  InvestmentWithDetails,
  CompanyRevision,
  RevisionFieldDecision
} from '@/lib/types'



// ==========================================
// API Fetches
// ==========================================

export async function fetchCompanies(): Promise<Company[]> {
  const data = await apiFetch<unknown[]>('/user/companies')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapCompany)
}

export async function fetchCompany(id: string): Promise<CompanyWithRelations | null> {
  const data = await apiFetch<unknown>(`/user/companies/${id}`)
  if (!data) return null
  return mapCompanyWithRelations(data)
}

export async function requestCompanyRevision(
  companyId: string,
  proposedChanges: Record<string, unknown>,
  token: string
): Promise<CompanyRevision> {
  const res = await authFetch(`${API_BASE}/user/revisions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      entity_type: 'company',
      entity_id: companyId,
      proposed_changes: proposedChanges
    })
  })
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body')
    console.error(`[requestCompanyRevision] Failed with status ${res.status}: ${errorBody}`)
    throw new Error('Failed to request company revision')
  }
  const data = await res.json()
  return mapCompanyRevision(data)
}

export async function fetchMyManagedCompanies(token: string): Promise<CompanyWithRelations[]> {
  const res = await authFetch(`${API_BASE}/user/companies/my-managed-companies`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body')
    console.error(`[fetchMyManagedCompanies] Failed with status ${res.status}: ${errorBody}`)
    throw new Error('Failed to fetch managed companies')
  }
  const data = await res.json()
  if (!data || !Array.isArray(data)) return []
  return data.map(mapCompanyWithRelations)
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body')
    console.error(`[uploadImage] Failed with status ${res.status}: ${errorBody}`)
    throw new Error('Failed to upload image')
  }

  const data = await res.json()
  if (!data.url) {
    throw new Error('Upload succeeded but no URL was returned')
  }
  return data.url
}

export async function fetchMyRevisions(token: string): Promise<CompanyRevision[]> {
  const res = await authFetch(`${API_BASE}/user/revisions/my`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  })
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body')
    console.error(`[fetchMyRevisions] Failed with status ${res.status}: ${errorBody}`)
    throw new Error('Failed to fetch my revisions')
  }
  const data = await res.json()
  if (!data || !Array.isArray(data)) return []
  return data.map(mapCompanyRevision)
}




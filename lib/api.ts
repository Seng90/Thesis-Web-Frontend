// ==========================================
// InvesTrack API Client
// Connects to NestJS + Prisma Backend
// Base URL: http://localhost:8000/api
// ==========================================

import type {
  Company,
  Investor,
  Founder,
  FundingRound,
  Investment,
  CompanyWithRelations,
  InvestorWithPortfolio,
  FounderWithRole,
  InvestmentWithDetails,
  InvestmentFull,
  Package,
  FundraisingPost,
  PostReactionSummary,
  PostComment,
  CompanyRevision,
  RevisionFieldDecision,
} from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ==========================================
// Snake_case → camelCase Mappers
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompany(raw: any): Company {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    industry: raw.industry ?? '',
    location: raw.location ?? '',
    contactEmail: raw.contact_email ?? '',
    foundedDate: raw.founded_date ?? null,
    status: raw.status ?? 'Pending',
    operatingStatus: raw.operating_status ?? 'Active',
    viewCount: raw.view_count ?? 0,
    logoUrl: raw.logo_url ?? null,
    websiteUrl: raw.website_url ?? null,
    facebookUrl: raw.facebook_url ?? null,
    linkedinUrl: raw.linkedin_url ?? null,
    registrationNumber: raw.registration_number ?? null,
    taxId: raw.tax_id ?? null,
    employeeCount: raw.employee_count ?? null,
    branchCount: typeof raw.branch_count === 'number' ? raw.branch_count : (raw.branch_count ? parseInt(raw.branch_count, 10) : null),
    headquartersAddress: raw.headquarters_address ?? null,
    keyProducts: Array.isArray(raw.key_products) ? raw.key_products : [],
    keyPartners: Array.isArray(raw.key_partners) ? raw.key_partners : [],
    founderRole: raw.founder_role ?? undefined,
    approvedBy: raw.approved_by ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

function mapInvestor(raw: any): Investor {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? '',
    logoUrl: raw.logo_url ?? null,
    websiteUrl: raw.website_url ?? null,
    contactInfo: raw.contact_info ?? null,
    investmentFocus: raw.investment_focus ?? undefined,
    preferredStages: Array.isArray(raw.preferred_stages) ? raw.preferred_stages : undefined,
    preferredIndustries: Array.isArray(raw.preferred_industries) ? raw.preferred_industries : undefined,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFounder(raw: any): Founder {
  return {
    id: raw.id,
    nameEn: raw.name_en ?? '',
    nameLa: raw.name_la ?? '',
    bio: raw.bio ?? undefined,
    linkedinUrl: raw.linkedin_url ?? undefined,
    role: raw.role ?? undefined,
    skills: Array.isArray(raw.skills) ? raw.skills : undefined,
    pastExperience: raw.past_experience ?? undefined,
    twitterUrl: raw.twitter_url ?? undefined,
    githubUrl: raw.github_url ?? undefined,
    avatarUrl: raw.avatar_url ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFundingRound(raw: any): FundingRound {
  return {
    id: raw.id,
    roundName: raw.round_name ?? '',
    description: raw.description ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestment(raw: any): Investment {
  return {
    id: raw.id,
    companyId: raw.company_id ?? raw.companyId ?? '',
    investorId: raw.investor_id ?? raw.investorId ?? null,
    customInvestorName: raw.custom_investor_name ?? raw.customInvestorName ?? undefined,
    roundId: raw.round_id ?? raw.roundId ?? '',
    amount: typeof raw.amount === 'string' ? (parseFloat(raw.amount) || 0) : (raw.amount ?? 0),
    currency: raw.currency ?? 'USD',
    investDate: raw.invest_date ?? raw.investDate ?? '',
    status: raw.status ?? 'Pending',
    referenceUrl: raw.reference_url ?? raw.referenceUrl ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    updatedAt: raw.updated_at ?? raw.updatedAt ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestmentWithDetails(raw: any): InvestmentWithDetails {
  const rawInvestor = raw.investors ?? raw.investor
  const rawRound = raw.funding_rounds ?? raw.funding_round
  return {
    ...mapInvestment(raw),
    investor: rawInvestor ? mapInvestor(rawInvestor) : null,
    round: mapFundingRound(rawRound ?? { id: raw.round_id || raw.roundId || '' }),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestmentFull(raw: any): InvestmentFull {
  const rawCompany = raw.companies ?? raw.company
  return {
    ...mapInvestmentWithDetails(raw),
    company: rawCompany 
      ? mapCompany(rawCompany) 
      : mapCompany({ id: raw.company_id || raw.companyId || '', name: 'Unknown Company' }),
  }
}

/**
 * Map a company API response (with nested relations) to CompanyWithRelations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompanyWithRelations(raw: any): CompanyWithRelations {
  const company = mapCompany(raw)

  // Map founders from companies_found junction
  const founders: FounderWithRole[] = (raw.companies_found ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cf: any) => ({
      ...mapFounder(cf.founders ?? cf.founder ?? { id: cf.founder_id || cf.founderId || '' }),
      role: cf.role ?? '',
      isActive: cf.is_active ?? cf.isActive ?? true,
    })
  )

  // Map investments with nested investor and funding_round
  const investments: InvestmentWithDetails[] = (raw.investments ?? []).map(mapInvestmentWithDetails)

  return { ...company, founders, investments }
}

/**
 * Map an investor API response (with nested investments) to InvestorWithPortfolio
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestorWithPortfolio(raw: any): InvestorWithPortfolio {
  const investor = mapInvestor(raw)

  const investments: (InvestmentWithDetails & { company: Company })[] = (raw.investments ?? []).map(
    (inv: any) => ({
      ...mapInvestmentWithDetails(inv),
      company: mapCompany(inv.companies ?? inv.company ?? { id: inv.company_id || inv.companyId || '', name: 'Unknown Company' }),
    })
  )

  return { ...investor, investments }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompanyRevision(raw: any): CompanyRevision {
  return {
    id: raw.id,
    entityType: raw.entity_type ?? 'company',
    entityId: raw.entity_id ?? null,
    proposedChanges: raw.proposed_changes ?? {},
    requestedBy: raw.requested_by ?? null,
    submittedBy: raw.submitted_by ?? null,
    submitterType: raw.submitter_type ?? 'member',
    reviewedBy: raw.reviewed_by ?? null,
    status: raw.status ?? 'Pending',
    fieldDecisions: (raw.field_decisions && typeof raw.field_decisions === 'object' && !Array.isArray(raw.field_decisions))
      ? Object.keys(raw.field_decisions).reduce((acc, key) => {
          const dec = raw.field_decisions[key]
          if (dec && typeof dec === 'object' && (dec.status === 'approved' || dec.status === 'rejected')) {
            acc[key] = {
              status: dec.status,
              reason: dec.reason ?? undefined,
            }
          }
          return acc
        }, {} as Record<string, RevisionFieldDecision>)
      : null,
    adminNote: raw.admin_note ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// ==========================================
// Fetch Functions
// ==========================================

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let res = await fetch(url, options)

  if (res.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('investrack_refresh_token')
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (refreshRes.ok) {
        const data = await refreshRes.json()
        localStorage.setItem('investrack_token', data.access_token)
        localStorage.setItem('investrack_refresh_token', data.refresh_token)
        window.dispatchEvent(new CustomEvent('investrack_token_refreshed', { detail: data.access_token }))

        const newHeaders = new Headers(options.headers)
        newHeaders.set('Authorization', `Bearer ${data.access_token}`)
        res = await fetch(url, { ...options, headers: newHeaders })
      } else {
        window.dispatchEvent(new Event('investrack_force_logout'))
      }
    } else {
      window.dispatchEvent(new Event('investrack_force_logout'))
    }
  }

  return res
}

// --- Companies ---

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

// --- Investors ---

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

// --- Investments ---

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

export async function fetchPackages(): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/user/packages`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch packages')
  const text = await res.text()
  if (!text) return []
  const data = JSON.parse(text)
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    features: p.features,
    purchaseCount: p.purchaseCount ?? p.purchase_count ?? 0,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,
  }))
}

const parseTags = (tags: any): string[] => {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags.trim()) {
    try {
      return JSON.parse(tags)
    } catch {
      return []
    }
  }
  return []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFundraisingPost(p: any): FundraisingPost {
  let derivedStatus = p.status ?? 'Active'
  if (derivedStatus === 'Active' && p.deadline) {
    const deadlineDate = new Date(p.deadline)
    // Set to end of day to be generous
    deadlineDate.setHours(23, 59, 59, 999)
    if (deadlineDate.getTime() < new Date().getTime()) {
      derivedStatus = 'Expired'
    }
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    companyId: p.companyId ?? p.company_id ?? '',
    companyName: p.companyName ?? p.company_name,
    roundType: p.roundType ?? p.round_type,
    targetAmountUsd: p.targetAmountUsd ?? p.target_amount_usd,
    minTicketUsd: p.minTicketUsd ?? p.min_ticket_usd,
    deadline: p.deadline,
    coverUrl: p.coverUrl ?? p.cover_url,
    tags: parseTags(p.tags),
    status: derivedStatus,
    adminFeedback: p.adminFeedback ?? p.admin_feedback,
    contactEmail: p.contactEmail ?? p.contact_email,
    pitchDeckUrl: p.pitchDeckUrl ?? p.pitch_deck_url,
    websiteUrl: p.websiteUrl ?? p.website_url,
    publishedAt: p.publishedAt ?? p.published_at,
    startDate: p.startDate ?? p.start_date,
  }
}

export async function fetchFundraisingPosts(): Promise<FundraisingPost[]> {
  const res = await fetch(`${API_BASE}/user/fundraising-posts`, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch fundraising posts')
  const text = await res.text()
  if (!text) return []
  const data = JSON.parse(text)
  return data.map(mapFundraisingPost)
}

export async function fetchFundraisingPostBySlug(slug: string): Promise<FundraisingPost | null> {
  const res = await fetch(`${API_BASE}/user/fundraising-posts/${slug}`, { next: { revalidate: 30 } })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch fundraising post detail')
  }
  const text = await res.text()
  if (!text) return null
  const p = JSON.parse(text)
  return mapFundraisingPost(p)
}

// --- Social Engagement (Likes & Comments) ---

export async function fetchPostReactions(id: string, token?: string): Promise<PostReactionSummary> {
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/reactions`, {
    headers,
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch post reactions')
  return await res.json()
}

export async function fetchPostComments(postId: string, token?: string): Promise<PostComment[]> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${postId}/comments`, {
    headers,
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch post comments')
  const rawData = await res.json()
  return rawData.map((c: any) => ({
    id: c.id,
    content: c.content,
    createdAt: c.created_at,
    username: c.member?.username ?? 'Unknown',
    avatarUrl: c.member?.avatar_url ?? null,
    likes: c.likes ?? 0,
    dislikes: c.dislikes ?? 0,
    currentUserReaction: c.currentUserReaction ?? null,
  }))
}

// --- Founders ---

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

// --- Funding Rounds ---

export async function fetchFundingRounds(): Promise<FundingRound[]> {
  const data = await apiFetch<unknown[]>('/user/funding-rounds')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFundingRound)
}

// --- Aggregated Stats ---

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

// --- Featured Companies ---

export async function fetchFeaturedCompanies(limit: number = 3): Promise<Company[]> {
  const companies = await fetchCompanies()
  return companies
    .filter((c) => c.status === 'Approved')
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit)
}

// --- Management APIs ---

export async function fetchMyPosts(token: string): Promise<FundraisingPost[]> {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/my-posts`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body')
    console.error(`[fetchMyPosts] Failed with status ${res.status}: ${errorBody}`)
    throw new Error('Failed to fetch my posts')
  }
  const data = await res.json()
  return data.map(mapFundraisingPost)
}

export async function updateFundraisingPost(id: string, token: string, payload: Record<string, any>) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const errorBody = await res.text()
    console.error('Update post error:', errorBody)
    throw new Error('Failed to update post')
  }
  return res.json()
}

export async function repostFundraisingPost(id: string, token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/repost`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to repost')
  return res.json()
}

export async function cancelFundraisingPost(id: string, token: string) {
  const res = await authFetch(`${API_BASE}/user/fundraising-posts/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to cancel post')
  return res.json()
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




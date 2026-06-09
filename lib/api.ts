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
  Package,
  FundraisingPost,
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
    viewCount: raw.view_count ?? 0,
    logoUrl: raw.logo_url ?? null,
    websiteUrl: raw.website_url ?? null,
    approvedBy: raw.approved_by ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestor(raw: any): Investor {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? '',
    logoUrl: raw.logo_url ?? null,
    websiteUrl: raw.website_url ?? null,
    contactInfo: raw.contact_info ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFounder(raw: any): Founder {
  return {
    id: raw.id,
    name: raw.name,
    bio: raw.bio ?? null,
    linkedinUrl: raw.linkedin_url ?? null,
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
    companyId: raw.company_id,
    investorId: raw.investor_id,
    roundId: raw.round_id,
    amount: typeof raw.amount === 'string' ? parseFloat(raw.amount) : raw.amount,
    currency: raw.currency ?? 'USD',
    investDate: raw.invest_date ?? '',
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
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
      ...mapFounder(cf.founders ?? cf.founder ?? {}),
      role: cf.role ?? '',
      isActive: cf.is_active ?? true,
    })
  )

  // Map investments with nested investor and funding_round
  const investments: InvestmentWithDetails[] = (raw.investments ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inv: any) => ({
      ...mapInvestment(inv),
      investor: mapInvestor(inv.investors ?? inv.investor ?? {}),
      round: mapFundingRound(inv.funding_rounds ?? inv.funding_round ?? {}),
    })
  )

  return { ...company, founders, investments }
}

/**
 * Map an investor API response (with nested investments) to InvestorWithPortfolio
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestorWithPortfolio(raw: any): InvestorWithPortfolio {
  const investor = mapInvestor(raw)

  const investments = (raw.investments ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inv: any) => ({
      ...mapInvestment(inv),
      company: mapCompany(inv.companies ?? inv.company ?? {}),
      round: mapFundingRound(inv.funding_rounds ?? inv.funding_round ?? {}),
    })
  )

  return { ...investor, investments }
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
  const res = await fetch(`${API_BASE}/user/investments`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch investments')
  const data = await res.json()
  return data.map(mapInvestment)
}

export async function fetchPackages(): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/user/packages`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch packages')
  const data = await res.json()
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

export async function fetchFundraisingPosts(): Promise<FundraisingPost[]> {
  const res = await fetch(`${API_BASE}/user/fundraising-posts`, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch fundraising posts')
  const data = await res.json()
  return data.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    companyName: p.companyName ?? p.company_name,
    roundType: p.roundType ?? p.round_type,
    targetAmountUsd: p.targetAmountUsd ?? p.target_amount_usd,
    minTicketUsd: p.minTicketUsd ?? p.min_ticket_usd,
    deadline: p.deadline,
    coverUrl: p.coverUrl ?? p.cover_url,
    tags: parseTags(p.tags),
    contactEmail: p.contactEmail ?? p.contact_email,
    pitchDeckUrl: p.pitchDeckUrl ?? p.pitch_deck_url,
    websiteUrl: p.websiteUrl ?? p.website_url,
    publishedAt: p.publishedAt ?? p.published_at,
  }))
}

export async function fetchFundraisingPostBySlug(slug: string): Promise<FundraisingPost | null> {
  const res = await fetch(`${API_BASE}/user/fundraising-posts/${slug}`, { next: { revalidate: 30 } })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch fundraising post detail')
  }
  const p = await res.json()
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    companyName: p.companyName ?? p.company_name,
    roundType: p.roundType ?? p.round_type,
    targetAmountUsd: p.targetAmountUsd ?? p.target_amount_usd,
    minTicketUsd: p.minTicketUsd ?? p.min_ticket_usd,
    deadline: p.deadline,
    coverUrl: p.coverUrl ?? p.cover_url,
    tags: parseTags(p.tags),
    contactEmail: p.contactEmail ?? p.contact_email,
    pitchDeckUrl: p.pitchDeckUrl ?? p.pitch_deck_url,
    websiteUrl: p.websiteUrl ?? p.website_url,
    publishedAt: p.publishedAt ?? p.published_at,
  }
}

// --- Founders ---

export async function fetchFounders(): Promise<Founder[]> {
  const data = await apiFetch<unknown[]>('/user/founders')
  if (!data || !Array.isArray(data)) return []
  return data.map(mapFounder)
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

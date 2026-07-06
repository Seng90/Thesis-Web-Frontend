/* eslint-disable @typescript-eslint/no-explicit-any */
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
  CompanyRevision,
  RevisionFieldDecision,
  FundraisingPost
} from './types'


export function mapCompany(raw: any): Company {
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


export function mapInvestor(raw: any): Investor {
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


export function mapFounder(raw: any): Founder {
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


export function mapFundingRound(raw: any): FundingRound {
  return {
    id: raw.id,
    roundName: raw.round_name ?? '',
    description: raw.description ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  }
}


export function mapInvestment(raw: any): Investment {
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


export function mapInvestmentWithDetails(raw: any): InvestmentWithDetails {
  const rawInvestor = raw.investors ?? raw.investor
  const rawRound = raw.funding_rounds ?? raw.funding_round
  return {
    ...mapInvestment(raw),
    investor: rawInvestor ? mapInvestor(rawInvestor) : null,
    round: mapFundingRound(rawRound ?? { id: raw.round_id || raw.roundId || '' }),
  }
}


export function mapInvestmentFull(raw: any): InvestmentFull {
  const rawCompany = raw.companies ?? raw.company
  return {
    ...mapInvestmentWithDetails(raw),
    company: rawCompany 
      ? mapCompany(rawCompany) 
      : mapCompany({ id: raw.company_id || raw.companyId || '', name: 'Unknown Company' }),
  }
}


export function mapCompanyWithRelations(raw: any): CompanyWithRelations {
  const company = mapCompany(raw)

  // Map founders from companies_found junction
  const founders: FounderWithRole[] = (raw.companies_found ?? []).map(
    
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


export function mapInvestorWithPortfolio(raw: any): InvestorWithPortfolio {
  const investor = mapInvestor(raw)

  const investments: (InvestmentWithDetails & { company: Company })[] = (raw.investments ?? []).map(
    (inv: any) => ({
      ...mapInvestmentWithDetails(inv),
      company: mapCompany(inv.companies ?? inv.company ?? { id: inv.company_id || inv.companyId || '', name: 'Unknown Company' }),
    })
  )

  return { ...investor, investments }
}


export function mapCompanyRevision(raw: any): CompanyRevision {
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


export function parseTags(tags: any): string[] {
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


export function mapFundraisingPost(p: any): FundraisingPost {
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

// ==========================================
// InvesTrack TypeScript Interfaces
// Matches Database Schema (11 Tables)
// ==========================================

// --- Auth ---

export interface AuthUser {
  id: string
  username?: string
  email?: string
  role?: string
  roles: string[]
  permissions: string[]
  avatarUrl?: string
}

// --- Core Entities ---

export interface Admin {
  id: string
  username: string
  password: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  location: string
  contactEmail: string
  foundedDate: string | null
  status: 'Approved' | 'Pending' | 'Rejected'
  operatingStatus: string
  viewCount: number
  logoUrl: string | null
  websiteUrl: string | null
  facebookUrl: string | null
  linkedinUrl: string | null
  registrationNumber: string | null
  taxId: string | null
  employeeCount: string | null
  branchCount: number | null
  headquartersAddress: string | null
  keyProducts: string[]
  keyPartners: string[]
  founderRole?: string
  approvedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Founder {
  id: string
  nameEn: string
  nameLa: string
  bio?: string
  linkedinUrl?: string
  role?: string
  skills?: string[]
  pastExperience?: string
  twitterUrl?: string
  githubUrl?: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface Investor {
  id: string
  name: string
  type: string
  logoUrl: string | null
  websiteUrl: string | null
  contactInfo: string | null
  investmentFocus?: string
  preferredStages?: string[]
  preferredIndustries?: string[]
  createdAt: string
  updatedAt: string
}

export interface FundingRound {
  id: string
  roundName: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Package {
  id: string
  name: string
  price: number
  features: string
  purchaseCount: number
  createdAt: string
  updatedAt: string
}

export interface FundraisingPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  companyName: string
  roundType: string
  targetAmountUsd: number
  minTicketUsd?: number
  deadline: string
  coverUrl: string | null
  tags: string[]
  status: 'Active' | 'Expired' | 'Cancelled' | 'Hidden'
  adminFeedback?: string
  contactEmail?: string
  pitchDeckUrl?: string
  websiteUrl?: string
  publishedAt: string
  startDate?: string
  companyId: string
}

export interface PostReactionSummary {
  likes: number
  dislikes: number
  currentUserReaction: 'LIKE' | 'DISLIKE' | null
}

export interface PostComment {
  id: string
  content: string
  createdAt: string
  username: string
  avatarUrl: string | null
  likes: number
  dislikes: number
  currentUserReaction: 'LIKE' | 'DISLIKE' | null
}

export interface Member {
  id: string
  username: string
  email: string
  password: string
  resetPasswordToken: string | null
  status: 'Active' | 'Inactive' | 'Suspended'
  packageId: string | null
  expiryDate: string | null
  createdAt: string
  updatedAt: string
}

// --- Associative / Junction Entities ---

export interface CompanyFound {
  id: string
  companyId: string
  founderId: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface Investment {
  id: string
  companyId: string
  investorId: string | null
  customInvestorName?: string
  roundId: string
  amount: number
  currency: string
  investDate: string
  status?: string
  referenceUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface ManageMember {
  id: string
  adminId: string
  memberId: string
  action: string
  createdAt: string
}

export interface Payment {
  id: string
  memberId: string
  packageId: string
  amount: number
  transId: string | null
  paymentMethod: string
  status: 'Pending' | 'Success' | 'Failed'
  createdAt: string
  updatedAt: string
}

// --- Joined / Display Types ---

export interface FounderWithRole extends Founder {
  role: string
  isActive: boolean
}

export interface InvestmentWithDetails extends Investment {
  investor: Investor | null
  round: FundingRound
}

export interface InvestmentFull extends InvestmentWithDetails {
  company: Company
}

export interface CompanyWithRelations extends Company {
  founders: FounderWithRole[]
  investments: InvestmentWithDetails[]
}

export interface InvestorWithPortfolio extends Investor {
  investments: (Investment & {
    company: Company
    round: FundingRound
  })[]
}

export interface RevisionFieldDecision {
  status: 'approved' | 'rejected'
  reason?: string
}

export interface CompanyRevision {
  id: string
  entityType: string
  entityId: string | null
  proposedChanges: Record<string, unknown>
  requestedBy: string | null
  submittedBy: string | null
  submitterType: 'admin' | 'member'
  reviewedBy: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | 'PartiallyApproved'
  fieldDecisions: Record<string, RevisionFieldDecision> | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
}


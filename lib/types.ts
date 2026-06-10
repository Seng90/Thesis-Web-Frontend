// ==========================================
// InvesTrack TypeScript Interfaces
// Matches Database Schema (11 Tables)
// ==========================================

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
  viewCount: number
  logoUrl: string | null
  websiteUrl: string | null
  approvedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Founder {
  id: string
  name: string
  bio: string | null
  linkedinUrl: string | null
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
  contactEmail?: string
  pitchDeckUrl?: string
  websiteUrl?: string
  publishedAt: string
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
  investorId: string
  roundId: string
  amount: number
  currency: string
  investDate: string
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
  investor: Investor
  round: FundingRound
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

// ==========================================
// Mock Data for Dashboard and Raises Pages
// ==========================================

export const dashboardStats = {
  totalFunding: 125.4, // in Millions
  companiesTracked: 142,
  activeInvestors: 38,
  fundingRounds: 86,
}

export const fundingOverTimeData = [
  { year: '2019', total: 5 },
  { year: '2020', total: 15 },
  { year: '2021', total: 32 },
  { year: '2022', total: 68 },
  { year: '2023', total: 105 },
  { year: '2024', total: 125.4 },
]

export const sectorDistributionData = [
  { name: 'Fintech', value: 45 },
  { name: 'E-commerce', value: 30 },
  { name: 'Logistics', value: 20 },
  { name: 'Healthtech', value: 15 },
  { name: 'Edtech', value: 10 },
  { name: 'Agritech', value: 5.4 },
]

export const topInvestorsMock = [
  { id: 'inv1', name: 'Mekong Capital', type: 'Private Equity', laoDeals: 12, laoFunded: 45.5, location: 'Vietnam' },
  { id: 'inv2', name: 'Lao Telecom Ventures', type: 'Corporate VC', laoDeals: 8, laoFunded: 22.0, location: 'Vientiane' },
  { id: 'inv3', name: 'Phongsavanh Group', type: 'Angel Syndicate', laoDeals: 5, laoFunded: 15.0, location: 'Vientiane' },
  { id: 'inv4', name: 'ADB Ventures', type: 'Institutional', laoDeals: 3, laoFunded: 12.5, location: 'Philippines' },
  { id: 'inv5', name: 'SADG Holdings', type: 'Family Office', laoDeals: 4, laoFunded: 8.0, location: 'Singapore' },
]

export interface PostCardData {
  slug: string
  title: string
  excerpt: string
  company_name: string
  round_type: string
  target_amount_usd: number
  deadline: string
  cover_url: string | null
  tags: string[]
  published_at: string
}

export const fundraisingPostsMock: PostCardData[] = [
  {
    slug: 'loca-series-b',
    title: 'Expanding EV Infrastructure across Laos',
    excerpt: 'We are raising our Series B to build 50 new EV charging stations and expand our ride-hailing fleet to 3 new provinces.',
    company_name: 'LOCA',
    round_type: 'Series B',
    target_amount_usd: 5000000,
    deadline: '2025-06-30T00:00:00Z',
    cover_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80',
    tags: ['Logistics', 'CleanTech', 'Mobility'],
    published_at: '2024-05-15T00:00:00Z',
  },
  {
    slug: 'sokxay-fintech-seed',
    title: 'Building the next-gen micro-lending platform',
    excerpt: 'Sokxay Finance is raising seed capital to launch an AI-driven credit scoring system for unbanked individuals in rural Laos.',
    company_name: 'Sokxay Finance',
    round_type: 'Seed',
    target_amount_usd: 800000,
    deadline: '2024-12-31T00:00:00Z',
    cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    tags: ['Fintech', 'Lending', 'AI'],
    published_at: '2024-06-01T00:00:00Z',
  },
  {
    slug: 'lao-agritech-pre-seed',
    title: 'Smart farming IoT solutions for coffee growers',
    excerpt: 'Developing affordable soil moisture and weather monitoring sensors tailored for Bolaven Plateau coffee farmers.',
    company_name: 'LaoSmartFarm',
    round_type: 'Pre-Seed',
    target_amount_usd: 150000,
    deadline: '2024-09-15T00:00:00Z',
    cover_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80',
    tags: ['Agritech', 'IoT', 'Hardware'],
    published_at: '2024-06-05T00:00:00Z',
  },
]

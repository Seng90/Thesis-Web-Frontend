// ==========================================
// InvesTrack Utility Functions
// ==========================================

/**
 * Format currency with appropriate symbol and formatting
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'LAK') {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Get year from date string
 */
export function getYear(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).getFullYear().toString()
}

/**
 * Get initials from a name (for avatar)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a consistent color based on a string (for avatar backgrounds)
 */
export function getNameColor(name: string): string {
  const colors = [
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-indigo-500',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Map industry to badge color classes
 */
export function getIndustryColor(industry: string): string {
  const colorMap: Record<string, string> = {
    FinTech: 'bg-blue-100 text-blue-700',
    AgriTech: 'bg-green-100 text-green-700',
    EdTech: 'bg-purple-100 text-purple-700',
    HealthTech: 'bg-red-100 text-red-700',
    Logistics: 'bg-amber-100 text-amber-700',
    'Tourism Tech': 'bg-cyan-100 text-cyan-700',
    'E-Commerce': 'bg-pink-100 text-pink-700',
    SaaS: 'bg-indigo-100 text-indigo-700',
  }
  return colorMap[industry] || 'bg-slate-100 text-slate-700'
}

/**
 * Map status to badge color classes
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-slate-100 text-slate-700',
    Success: 'bg-emerald-100 text-emerald-700',
    Failed: 'bg-red-100 text-red-700',
  }
  return colorMap[status] || 'bg-slate-100 text-slate-700'
}

/**
 * Map investor type to badge color classes
 */
export function getInvestorTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'Venture Capital': 'bg-indigo-100 text-indigo-700',
    'Angel Investor': 'bg-violet-100 text-violet-700',
    Corporate: 'bg-slate-100 text-slate-700',
    'Private Equity': 'bg-blue-100 text-blue-700',
    Government: 'bg-emerald-100 text-emerald-700',
  }
  return colorMap[type] || 'bg-slate-100 text-slate-700'
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Calculate total funding for a company
 */
export function calculateTotalFunding(
  investments: { amount: number; currency: string }[]
): { usd: number; lak: number } {
  return investments.reduce(
    (acc, inv) => {
      if (inv.currency === 'USD') acc.usd += inv.amount
      else if (inv.currency === 'LAK') acc.lak += inv.amount
      return acc
    },
    { usd: 0, lak: 0 }
  )
}

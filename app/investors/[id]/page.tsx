import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchInvestor } from '@/lib/api'
import { getInitials, getNameColor, formatDate, formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import CompanyCard from '@/components/cards/CompanyCard'
import { Globe, Mail, ChevronLeft, Briefcase, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const investor = await fetchInvestor(id)
  
  if (!investor) {
    return { title: 'Investor Not Found' }
  }
  
  return {
    title: `${investor.name} | Investor Profile`,
  }
}

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const investor = await fetchInvestor(id)

  if (!investor) {
    notFound()
  }

  // Get unique portfolio companies from investments
  const portfolioCompaniesMap = new Map()
  investor.investments.forEach(inv => {
    if (inv.company && !portfolioCompaniesMap.has(inv.company.id)) {
      portfolioCompaniesMap.set(inv.company.id, inv.company)
    }
  })
  const portfolioCompanies = Array.from(portfolioCompaniesMap.values())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Link */}
      <Link 
        href="/investors" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Investors
      </Link>

      {/* Hero Header */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${getNameColor(investor.name)} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-bold text-3xl sm:text-4xl">{getInitials(investor.name)}</span>
          </div>
          
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{investor.name}</h1>
              <Badge variant="type" value={investor.type} />
            </div>
            
            {/* Quick Links Row */}
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              {investor.websiteUrl && (
                <a href={investor.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Website
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
              {investor.contactInfo && (
                <a href={investor.contactInfo.includes('@') ? `mailto:${investor.contactInfo}` : '#'} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {investor.contactInfo}
                </a>
              )}
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                <Briefcase className="w-4 h-4" />
                {portfolioCompanies.length} Portfolio Companies
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        
        {/* About Section */}
        <section className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">About</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Investment Focus</h3>
              {investor.investmentFocus ? (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{investor.investmentFocus}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">No investment focus specified.</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Preferred Stages</h3>
                {investor.preferredStages && investor.preferredStages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {investor.preferredStages.map(stage => (
                      <span key={stage} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium">
                        {stage}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic text-sm">Not specified</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Preferred Industries</h3>
                {investor.preferredIndustries && investor.preferredIndustries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {investor.preferredIndustries.map(ind => (
                      <span key={ind} className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                        {ind}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic text-sm">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Portfolio Section */}
        {portfolioCompanies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioCompanies.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}

        {/* Investment History Section */}
        <section className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8 overflow-hidden">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Investment History</h2>
          
          {investor.investments.length > 0 ? (
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-surface-900/50 rounded-xl">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-xl">Date</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Round</th>
                    <th className="px-4 py-3 font-medium rounded-r-xl">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {investor.investments.map(inv => (
                    <tr key={inv.id} className="border-b border-slate-100 dark:border-surface-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-surface-900/50 transition-colors">
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDate(inv.investDate)}</td>
                      <td className="px-4 py-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        <Link href={`/companies/${inv.companyId}`}>{inv.company?.name ?? 'Unknown'}</Link>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{inv.round?.roundName ?? '—'}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(inv.amount, inv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No public investment records available.</p>
          )}
        </section>

      </div>
    </div>
  )
}

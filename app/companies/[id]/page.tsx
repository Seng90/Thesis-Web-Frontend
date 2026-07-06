import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchCompany } from '@/features/companies/api/companiesApi'
import { formatDate, formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import CompanyLogo from '@/components/ui/CompanyLogo'
import FundingHistoryTable from '@/components/FundingHistoryTable'
import FundingTimeChart from '@/components/analytics/FundingTimeChart'
import RoundDistributionChart from '@/components/analytics/RoundDistributionChart'
import TopInvestors from '@/components/analytics/TopInvestors'
import { MapPin, Globe, Mail, Calendar, Users, TrendingUp, ChevronLeft, ExternalLink, CheckCircle, Info, Star, Briefcase, Activity, FileText, Receipt, PieChart as PieChartIcon, Award } from 'lucide-react'
import FounderCard from '@/components/cards/FounderCard'
import ViewCounter from '@/components/ViewCounter'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const company = await fetchCompany(id)
  
  if (!company) {
    return { title: 'Company Not Found' }
  }
  
  return {
    title: company.name,
    description: company.description,
  }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await fetchCompany(id)

  if (!company) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <ViewCounter companyId={company.id} />
      {/* Back Link */}
      <Link 
        href="/companies" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Companies
      </Link>

      {/* Hero Header with Premium Cover */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-xl overflow-hidden mb-8 relative group">
        {/* Abstract Premium Mesh Background */}
        <div className="absolute inset-0 z-0 h-56 w-full bg-slate-900 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
          {/* Animated/Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse-slow"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
          {/* subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        </div>
        
        {/* Glassmorphism content wrapper */}
        <div className="relative z-10 pt-32 px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Overlapping Avatar with Glass effect */}
            <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl p-2.5 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 ring-4 ring-white/20 dark:ring-black/20">
              <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="lg" />
            </div>
            
            {/* Main Info with improved typography */}
            <div className="flex-1 mb-2 bg-white/40 dark:bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{company.name}</h1>
                {company.registrationNumber && company.taxId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-md shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verified Business
                  </span>
                )}
                <Badge variant="status" value={company.status} />
                <Badge variant="industry" value={company.industry} />
              </div>
              
              <p className="text-slate-800 dark:text-slate-200 text-lg max-w-4xl leading-relaxed font-medium">
                {company.description}
              </p>
              
              {/* Additional Social Links (Premium Pills) */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                {company.websiteUrl ? (
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                ) : (
                  <span className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-surface-700">
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </span>
                )}

                {company.facebookUrl ? (
                  <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-100 hover:border-blue-100 dark:bg-surface-800 dark:text-slate-300 dark:border-surface-700 dark:hover:border-blue-500/30 hover:-translate-y-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </a>
                ) : (
                  <span className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent dark:bg-surface-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </span>
                )}

                {company.linkedinUrl ? (
                  <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-white text-slate-700 hover:text-sky-600 shadow-md border border-slate-100 hover:border-sky-100 dark:bg-surface-800 dark:text-slate-300 dark:border-surface-700 dark:hover:border-sky-500/30 hover:-translate-y-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                ) : (
                  <span className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent dark:bg-surface-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Location */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-5 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-slate-50 dark:bg-surface-700 rounded-xl text-slate-500 dark:text-slate-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Location</span>
            <span className="font-bold text-slate-900 dark:text-white truncate">{company.location || 'N/A'}</span>
          </div>
        </div>

        {/* Contact Email */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-5 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Contact</span>
            {company.contactEmail ? (
              <a href={`mailto:${company.contactEmail}`} className="font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600">{company.contactEmail}</a>
            ) : (
              <span className="font-bold text-slate-500 dark:text-slate-400">N/A</span>
            )}
          </div>
        </div>

        {/* Employees */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-5 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Employees</span>
            <span className="font-bold text-slate-900 dark:text-white truncate">{company.employeeCount || 'N/A'}</span>
          </div>
        </div>

        {/* Operating Status */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-5 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Status</span>
            <span className="font-bold text-slate-900 dark:text-white truncate">{company.operatingStatus || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (About + Highlights) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">About Company</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Founded</p>
                  <p className="font-medium text-slate-900 dark:text-white">{company.foundedDate ? formatDate(company.foundedDate) : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Listed On</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(company.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Branches</p>
                  <p className="font-medium text-slate-900 dark:text-white">{company.branchCount !== null ? `${company.branchCount} Locations` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Headquarters</p>
                  <p className="font-medium text-slate-900 dark:text-white">{company.headquartersAddress || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Registration Number</p>
                  <p className="font-medium text-slate-900 dark:text-white">{company.registrationNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Tax ID</p>
                  <p className="font-medium text-slate-900 dark:text-white">{company.taxId || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Highlights & Partners inline */}
            <div className="border-t border-slate-100 dark:border-surface-700 pt-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Highlights & Partners</h3>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Key Products / Services</h4>
                <div className="flex flex-wrap gap-2">
                  {company.keyProducts && company.keyProducts.length > 0 ? (
                    company.keyProducts.map((product, i) => (
                      <span key={i} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/60 dark:bg-surface-700/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 shadow-sm backdrop-blur-md">
                        {product}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400 italic">N/A</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Key Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {company.keyPartners && company.keyPartners.length > 0 ? (
                    company.keyPartners.map((partner, i) => (
                      <span key={i} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/60 dark:bg-surface-700/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 shadow-sm backdrop-blur-md">
                        {partner}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400 italic">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (Founders) */}
        {company.founders.length > 0 && (
          <section className="lg:col-span-1 bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Founding Team</h2>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {company.founders.map(founder => (
                <div key={founder.id} className="bg-slate-50 dark:bg-surface-700/50 rounded-2xl p-4 border border-slate-100 dark:border-surface-700">
                  <FounderCard founder={founder} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Analytics Bento Cards */}
        {company.investments.length > 0 && (
          <>
            {/* Funding Over Time */}
            <section className="lg:col-span-2 bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Funding Over Time</h3>
              </div>
              <FundingTimeChart investments={company.investments} />
            </section>

            {/* Round Distribution */}
            <section className="lg:col-span-1 bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Round Distribution</h3>
              </div>
              <RoundDistributionChart investments={company.investments} />
            </section>
            
            {/* Top Investors */}
            <section className="lg:col-span-3 bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Investors</h3>
              </div>
              <TopInvestors investments={company.investments} />
            </section>

            {/* Funding History Table */}
            <section className="lg:col-span-3 bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Funding History</h2>
              </div>
              <FundingHistoryTable investments={company.investments} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}

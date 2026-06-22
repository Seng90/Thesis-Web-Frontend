import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchCompany } from '@/lib/api'
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

      {/* Hero Header with Cover Image */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm overflow-hidden mb-6">
        {/* Cover Gradient */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Overlapping Avatar */}
            <div className="-mt-12 bg-white dark:bg-surface-800 p-2 rounded-2xl shadow-sm border border-slate-200/60 dark:border-surface-700">
              <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="lg" />
            </div>
            
            {/* Main Info */}
            <div className="flex-1 mt-2 md:mt-4">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                {company.registrationNumber && company.taxId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Business
                  </span>
                )}
                <Badge variant="status" value={company.status} />
                <Badge variant="industry" value={company.industry} />
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-4xl leading-relaxed">
                {company.description}
              </p>
              
              {/* Additional Social Links */}
              <div className="flex items-center gap-4 mt-4">
                {company.facebookUrl && (
                  <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {company.linkedinUrl && (
                  <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <Briefcase className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-5 mb-8 overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap items-center justify-between min-w-max gap-8 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-surface-700 rounded-lg text-slate-500 dark:text-slate-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Location</span>
              <span className="font-semibold text-slate-900 dark:text-white">{company.location}</span>
            </div>
          </div>
          
          {company.websiteUrl && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Website</span>
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  Visit Site <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-surface-700 rounded-lg text-slate-500 dark:text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Contact Email</span>
              <a href={`mailto:${company.contactEmail}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                {company.contactEmail}
              </a>
            </div>
          </div>
          
          {company.employeeCount && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 dark:bg-surface-700 rounded-lg text-slate-500 dark:text-slate-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Employees</span>
                <span className="font-semibold text-slate-900 dark:text-white">{company.employeeCount}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-surface-700 rounded-lg text-slate-500 dark:text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Founded</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatDate(company.foundedDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-surface-700 rounded-lg text-slate-500 dark:text-slate-400">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Operating Status</span>
              <span className="font-semibold text-slate-900 dark:text-white">{company.operatingStatus}</span>
            </div>
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
              {company.branchCount !== null && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Branches</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.branchCount} Locations</p>
                  </div>
                </div>
              )}
              
              {company.headquartersAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Headquarters</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.headquartersAddress}</p>
                  </div>
                </div>
              )}

              {company.registrationNumber && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Registration Number</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.registrationNumber}</p>
                  </div>
                </div>
              )}

              {company.taxId && (
                <div className="flex items-start gap-3">
                  <Receipt className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Tax ID</p>
                    <p className="font-medium text-slate-900 dark:text-white">{company.taxId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Highlights & Partners inline */}
            {(company.keyProducts.length > 0 || company.keyPartners.length > 0) && (
              <div className="border-t border-slate-100 dark:border-surface-700 pt-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Highlights & Partners</h3>
                </div>

                {company.keyProducts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Key Products / Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.keyProducts.map((product, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {company.keyPartners.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Key Partners</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.keyPartners.map((partner, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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

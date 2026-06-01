import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchCompany } from '@/lib/api'
import { getInitials, getNameColor, formatDate, formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { MapPin, Globe, Mail, Calendar, Users, TrendingUp, ChevronLeft, ExternalLink } from 'lucide-react'
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
      {/* Back Link */}
      <Link 
        href="/companies" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Companies
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${getNameColor(company.name)} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-bold text-3xl sm:text-4xl">{getInitials(company.name)}</span>
          </div>
          
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{company.name}</h1>
              <Badge variant="status" value={company.status} />
              <Badge variant="industry" value={company.industry} />
            </div>
            
            <p className="text-slate-600 text-lg mb-6 max-w-3xl leading-relaxed">
              {company.description}
            </p>
            
            {/* Quick Links Row */}
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {company.location}
              </div>
              {company.websiteUrl && (
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Website
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
              <a href={`mailto:${company.contactEmail}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <Mail className="w-4 h-4 text-slate-400" />
                {company.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Founders Section */}
          {company.founders.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Founding Team</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.founders.map(founder => (
                  <div key={founder.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getNameColor(founder.name)} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-sm">{getInitials(founder.name)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{founder.name}</h3>
                      <p className="text-sm text-indigo-600 font-medium mb-1">{founder.role}</p>
                      {founder.bio && (
                        <p className="text-xs text-slate-500 line-clamp-2">{founder.bio}</p>
                      )}
                      {founder.linkedinUrl && (
                        <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors mt-1 inline-block">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Funding Section */}
          <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Funding History</h2>
            </div>
            
            {company.investments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 rounded-xl">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-l-xl">Round</th>
                      <th className="px-4 py-3 font-medium">Investor</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium rounded-r-xl">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.investments.map(inv => (
                      <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-900">{inv.round.roundName}</td>
                        <td className="px-4 py-4 text-indigo-600 hover:underline">
                          <Link href={`/investors/${inv.investorId}`}>{inv.investor.name}</Link>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(inv.amount, inv.currency)}</td>
                        <td className="px-4 py-4 text-slate-500">{formatDate(inv.investDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No public funding data available.</p>
            )}
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 px-2">Quick Facts</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="flex items-center text-slate-500 text-sm gap-2">
                  <Calendar className="w-4 h-4" /> Founded
                </span>
                <span className="font-medium text-slate-900 text-sm">{formatDate(company.foundedDate)}</span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="flex items-center text-slate-500 text-sm gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </span>
                <span className="font-medium text-slate-900 text-sm">{company.location}</span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="flex items-center text-slate-500 text-sm gap-2">
                  <Globe className="w-4 h-4" /> Industry
                </span>
                <span className="font-medium text-slate-900 text-sm">{company.industry}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

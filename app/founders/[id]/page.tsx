import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchFounder, fetchFounderCompanies } from '@/lib/api'
import { getInitials, getNameColor } from '@/lib/utils'
import { ChevronLeft, ExternalLink, Briefcase } from 'lucide-react'
import CompanyLogo from '@/components/ui/CompanyLogo'
import type { Metadata } from 'next'
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const founder = await fetchFounder(id)
  if (!founder) return { title: 'Founder Not Found' }
  const displayName = founder.nameLa ? `${founder.nameLa} (${founder.nameEn})` : founder.nameEn
  return { title: displayName, description: founder.bio || `Profile of ${displayName}` }
}

export default async function FounderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [founder, companies] = await Promise.all([
    fetchFounder(id),
    fetchFounderCompanies(id)
  ])

  if (!founder) notFound()

  const displayName = founder.nameLa ? `${founder.nameLa} (${founder.nameEn})` : founder.nameEn

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link href="/companies" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getNameColor(founder.nameEn)} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-bold text-2xl">{getInitials(founder.nameEn)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{displayName}</h1>
            {founder.bio && <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">{founder.bio}</p>}
            {founder.linkedinUrl && (
              <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                <ExternalLink className="w-4 h-4" /> LinkedIn Profile <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Companies Founded */}
      {companies.length > 0 && (
        <section className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Companies Founded</h2>
          </div>
          <div className="space-y-4">
            {companies.map(company => (
              <Link key={company.id} href={`/companies/${company.id}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-surface-700 bg-slate-50/50 dark:bg-surface-900/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group">
                <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{company.name}</h3>
                    {company.founderRole && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20">
                        {company.founderRole}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{company.industry} · {company.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

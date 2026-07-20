import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchFounder, fetchFounderCompanies } from '@/features/founders/api/foundersApi'
import { getInitials, getNameColor, getImageUrl } from '@/lib/utils'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Link */}
      <Link href="/companies" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      {/* Hero Header */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200/60 dark:border-surface-700 shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0 shadow-md flex items-center justify-center overflow-hidden ${!founder.avatarUrl ? `bg-gradient-to-br ${getNameColor(founder.nameEn)}` : 'bg-slate-100 border border-slate-200'}`}>
            {founder.avatarUrl ? (
              <img src={getImageUrl(founder.avatarUrl)} alt={founder.nameEn} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-3xl sm:text-4xl">{getInitials(founder.nameEn)}</span>
            )}
          </div>
          
          {/* Main Info */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{displayName}</h1>
            
            {/* Quick Links Row */}
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              {founder.linkedinUrl && (
                <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                  <ExternalLink className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {founder.twitterUrl && (
                <a href={founder.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Twitter / X
                </a>
              )}
              {founder.githubUrl && (
                <a href={founder.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-surface-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-600 transition-colors">
                  <ExternalLink className="w-4 h-4" /> GitHub
                </a>
              )}
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg">
                <Briefcase className="w-4 h-4" />
                {companies.length} Companies Founded
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
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Biography</h3>
              {founder.bio ? (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{founder.bio}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">No biography provided.</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Past Experience</h3>
                {founder.pastExperience ? (
                  <p className="text-slate-700 dark:text-slate-300">{founder.pastExperience}</p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic text-sm">Not specified</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Skills & Expertise</h3>
                {founder.skills && founder.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {founder.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium">
                        {skill}
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

        {/* Companies Founded */}
        {companies.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Companies Founded</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map(company => (
                <Link key={company.id} href={`/companies/${company.id}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group">
                  <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{company.name}</h3>
                      {company.founderRole && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20">
                          {company.founderRole}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{company.industry} · {company.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

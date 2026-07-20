import Link from 'next/link'
import { Globe, Mail } from 'lucide-react'
import type { Investor } from '@/lib/types'
import { getInitials, getNameColor, getImageUrl } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface InvestorCardProps {
  investor: Investor
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  const initials = getInitials(investor.name)
  const avatarColor = getNameColor(investor.name)

  return (
    <Link href={`/investors/${investor.id}`} className="group block">
      <div className="rounded-2xl border border-slate-200/60 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-indigo-500/10">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm ${!investor.logoUrl ? `bg-gradient-to-br ${avatarColor} text-white font-bold text-sm` : 'bg-white border border-slate-200/60 p-1.5'}`}
          >
            {investor.logoUrl ? (
              <img src={getImageUrl(investor.logoUrl)} alt={investor.name} className="max-w-full max-h-full object-contain" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white transition-colors duration-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {investor.name}
            </h3>
            <div className="mt-1">
              <Badge variant="type" value={investor.type} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3 border-t border-slate-100 dark:border-surface-700 pt-4">
          <div className="space-y-2">
            {investor.websiteUrl && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Globe className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate transition-colors duration-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                  {investor.websiteUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
            {investor.contactInfo && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{investor.contactInfo}</span>
              </div>
            )}
            {!investor.websiteUrl && !investor.contactInfo && (
              <p className="text-sm italic text-slate-400 dark:text-slate-500">
                No contact information available
              </p>
            )}
          </div>
          
          {investor.preferredStages && investor.preferredStages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {investor.preferredStages.map((stage) => (
                <span key={stage} className="inline-flex items-center rounded-md bg-slate-100 dark:bg-surface-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {stage}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

import Link from 'next/link'
import { Globe, Mail } from 'lucide-react'
import type { Investor } from '@/lib/types'
import { getInitials, getNameColor } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface InvestorCardProps {
  investor: Investor
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  const initials = getInitials(investor.name)
  const avatarColor = getNameColor(investor.name)

  return (
    <Link href={`/investors/${investor.id}`} className="group block">
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} text-sm font-bold text-white shadow-sm`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
              {investor.name}
            </h3>
            <div className="mt-1">
              <Badge variant="type" value={investor.type} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          {investor.websiteUrl && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Globe className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate transition-colors duration-200 group-hover:text-indigo-500">
                {investor.websiteUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          )}
          {investor.contactInfo && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{investor.contactInfo}</span>
            </div>
          )}
          {!investor.websiteUrl && !investor.contactInfo && (
            <p className="text-sm italic text-slate-400">
              No contact information available
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

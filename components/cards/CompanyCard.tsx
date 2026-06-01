import Link from 'next/link'
import { MapPin, Eye, Calendar } from 'lucide-react'
import type { Company } from '@/lib/types'
import { getInitials, getNameColor, getYear } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const initials = getInitials(company.name)
  const avatarColor = getNameColor(company.name)

  return (
    <Link href={`/companies/${company.id}`} className="group block">
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
              {company.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="industry" value={company.industry} />
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{company.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {company.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Founded {getYear(company.foundedDate)}</span>
            </div>
            <Badge variant="status" value={company.status} />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="h-3.5 w-3.5" />
            <span>{company.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

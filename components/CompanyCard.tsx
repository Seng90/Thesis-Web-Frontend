import Link from 'next/link'
import { MapPin, Eye, ChevronRight } from 'lucide-react'
import type { Company } from '@/lib/types'
import { getInitials, getNameColor, getIndustryColor, truncateText, getYear } from '@/lib/utils'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`}>
      <div className="group flex h-full flex-col rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getNameColor(company.name)} text-lg font-bold text-white shadow-md`}
          >
            {getInitials(company.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {company.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getIndustryColor(company.industry)}`}
              >
                {company.industry}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">
          {truncateText(company.description)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {company.location}
            </span>
            {company.foundedDate && (
              <span>Est. {getYear(company.foundedDate)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              {company.viewCount.toLocaleString()}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
          </div>
        </div>
      </div>
    </Link>
  )
}

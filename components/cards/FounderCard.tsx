'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getInitials, getNameColor } from '@/lib/utils'
import { ExternalLink, ArrowRight } from 'lucide-react'
import type { FounderWithRole } from '@/lib/types'

export default function FounderCard({ founder }: { founder: FounderWithRole }) {
  const [showPopup, setShowPopup] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowPopup(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = founder.nameLa ? `${founder.nameLa} (${founder.nameEn})` : founder.nameEn
  return (
    <div className="relative" ref={cardRef}>
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="w-full text-left flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-surface-700 bg-slate-50/50 dark:bg-surface-900/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getNameColor(founder.nameEn)} flex items-center justify-center shrink-0`}>
          <span className="text-white font-bold text-sm">{getInitials(founder.nameEn)}</span>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{displayName}</h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">{founder.role}</p>
          {founder.bio && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{founder.bio}</p>}
        </div>
      </button>

      {/* Popup Card */}
      {showPopup && (
        <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-white dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-xl p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getNameColor(founder.nameEn)} flex items-center justify-center shrink-0`}>
              <span className="text-white font-bold text-lg">{getInitials(founder.nameEn)}</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">{displayName}</h4>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{founder.role}</p>
            </div>
          </div>
          
          {founder.bio && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{founder.bio}</p>
          )}

          <div className="flex flex-col gap-2">
            {founder.linkedinUrl && (
              <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                <ExternalLink className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Link
              href={`/founders/${founder.id}`}
              className="flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors justify-center"
            >
              View Full Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

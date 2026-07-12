/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { getInitials, getNameColor, getImageUrl } from '@/lib/utils'

interface CompanyLogoProps {
  logoUrl?: string | null
  name: string
  size?: 'sm' | 'lg'
}

export default function CompanyLogo({ logoUrl, name, size = 'sm' }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false)
  const initials = getInitials(name)
  const avatarColor = getNameColor(name)

  const isLg = size === 'lg'
  
  // Wrapper classes based on size
  const wrapperClassLg = "w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border border-slate-200/60 dark:border-surface-700 flex items-center justify-center shrink-0 shadow-md p-3 overflow-hidden"
  const wrapperClassSm = "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 dark:border-surface-700 bg-white p-1.5 shadow-sm overflow-hidden"
  
  const fallbackClassLg = `w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0 shadow-md`
  const fallbackClassSm = `flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} text-sm font-bold text-white shadow-sm`

  if (!logoUrl || hasError) {
    return (
      <div className={isLg ? fallbackClassLg : fallbackClassSm}>
        <span className={isLg ? "text-white font-bold text-3xl sm:text-4xl" : ""}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={isLg ? wrapperClassLg : wrapperClassSm}>
      <img 
        src={getImageUrl(logoUrl)} 
        alt={name} 
        className="max-w-full max-h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

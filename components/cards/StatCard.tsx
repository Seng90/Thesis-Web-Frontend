'use client'

import { useEffect, useRef, useState } from 'react'

interface StatCardProps {
  value: number
  label: string
  icon: React.ReactNode
  prefix?: string
  suffix?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function StatCard({
  value,
  label,
  icon,
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const duration = 2000 // 2 seconds

  useEffect(() => {
    startTimeRef.current = 0

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      setDisplayValue(Math.round(easedProgress * value))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-surface-700 border-l-4 border-l-indigo-500 bg-white dark:bg-surface-800 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative gradient dot */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 opacity-60 transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>

        {/* Content */}
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

import { CheckCircle, Star } from 'lucide-react'
import type { Package } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface PackageCardProps {
  pkg: Package
  isPopular?: boolean
}

export default function PackageCard({ pkg, isPopular = false }: PackageCardProps) {
  let features: string[] = []
  if (Array.isArray(pkg.features)) {
    features = pkg.features
  } else if (typeof pkg.features === 'string') {
    try {
      const parsed = JSON.parse(pkg.features)
      if (Array.isArray(parsed)) features = parsed
      else features = [pkg.features]
    } catch {
      // Split by newline, pipe, or comma
      features = pkg.features.split(/[\n|,]+/).map((f) => f.trim()).filter(Boolean)
    }
  }

  return (
    <div
      className={`relative rounded-2xl border bg-white dark:bg-surface-800 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPopular
          ? 'border-indigo-200 dark:border-indigo-500/30 ring-2 ring-indigo-500 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-500/20'
          : 'border-slate-200/60 dark:border-surface-700 shadow-sm'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25">
            <Star className="h-3.5 w-3.5 fill-current" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className={isPopular ? 'mt-2' : ''}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(pkg.price, 'LAK')}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/month</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-100 dark:bg-surface-700" />

      {/* Features */}
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                isPopular ? 'text-indigo-500' : 'text-emerald-500'
              }`}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <Button
          variant={isPopular ? 'primary' : 'outline'}
          size="lg"
          href="/signup"
          className="w-full justify-center"
        >
          Get Started
        </Button>
      </div>

      {/* Purchase count */}
      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        {pkg.purchaseCount.toLocaleString()} businesses subscribed
      </p>
    </div>
  )
}

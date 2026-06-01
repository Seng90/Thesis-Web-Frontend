import { CheckCircle, Star } from 'lucide-react'
import type { Package } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface PackageCardProps {
  pkg: Package
  isPopular?: boolean
}

export default function PackageCard({ pkg, isPopular = false }: PackageCardProps) {
  const features = pkg.features.split('|')
  const isFree = pkg.price === 0

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPopular
          ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500'
          : 'border-slate-200/60 bg-white shadow-sm'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
            <Star className="h-3.5 w-3.5 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {isFree ? 'Get started for free' : 'Unlock the full experience'}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-slate-900">Free</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-slate-900">
              {formatCurrency(pkg.price, 'LAK')}
            </span>
            <span className="text-sm font-medium text-slate-500">/month</span>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isPopular ? 'text-indigo-500' : 'text-emerald-500'
              }`}
            />
            <span className="text-sm text-slate-600">{feature.trim()}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
          isPopular
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50'
            : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
        }`}
      >
        {isFree ? 'Get Started' : 'Upgrade Now'}
      </button>

      {/* Purchase Count */}
      <p className="mt-4 text-center text-xs text-slate-400">
        {pkg.purchaseCount}+ users on this plan
      </p>
    </div>
  )
}

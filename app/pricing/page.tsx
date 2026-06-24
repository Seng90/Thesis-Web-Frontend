import type { Package } from '@/lib/types'
import { fetchPackages } from '@/lib/api'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Lock, Zap, Crown, ArrowRight } from 'lucide-react'
import PricingPlanActions from './PricingPlanActions'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the right plan to access comprehensive data on the Lao startup ecosystem.',
}

const GATED_AREAS = [
  { icon: Zap, label: "Funding Rounds", desc: "Round size, valuations, lead investors, dates." },
  { icon: Sparkles, label: "Team & Leadership", desc: "Full leadership details and key personnel per company." },
  { icon: Crown, label: "Compare Tool", desc: "Radar charts and head-to-head metric comparison." },
  { icon: Lock, label: "Data Exports", desc: "Download filtered company lists as CSV." },
]

export default async function PricingPage() {
  let pkgList: Package[] = []
  
  try {
    pkgList = await fetchPackages()
  } catch (error) {
    console.error('Failed to fetch packages:', error)
  }

  // Sort packages by price
  pkgList.sort((a, b) => a.price - b.price)

  const isPro = (name: string) => name.toLowerCase() === 'premium' || name.toLowerCase() === 'pro' || name.toLowerCase() === 'enterprise'

  const parseFeatures = (feat: any): string[] => {
    if (Array.isArray(feat)) return feat
    if (typeof feat === 'string') {
      try {
        const parsed = JSON.parse(feat)
        if (Array.isArray(parsed)) return parsed
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.entries(parsed).map(([k, v]) => {
            const keyFormatted = k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            const valFormatted = v === -1 ? 'Unlimited' : v
            return `${keyFormatted}: ${valFormatted}`
          })
        }
        return [feat]
      } catch {
        return feat.split(/[\n|,]+/).map((f) => f.trim()).filter(Boolean)
      }
    }
    return []
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-950 pt-20 pb-16 md:pt-24 md:pb-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              Membership
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Unlock the full Lao <span className="text-indigo-600 dark:text-indigo-400">investment ecosystem</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Go deeper into funding rounds, investor networks, and exclusive insights. Support our independent platform and get the data edge you need.
            </p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="container mx-auto px-4 py-20">
        <div className={`mx-auto grid max-w-6xl gap-8 ${pkgList.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {pkgList.map((pkg, idx) => {
            const popular = isPro(pkg.name) && idx === 1;
            const features = parseFeatures(pkg.features)

            return (
              <div 
                key={pkg.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  popular 
                    ? 'border-2 border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md'
                }`}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                      <Crown className="h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10">
                  {popular ? 'Full access to every data point and insight on the platform.' : 'Explore the basics of the Lao startup scene.'}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
                    ${pkg.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {pkg.price > 0 ? '/month' : '/forever'}
                  </span>
                </div>

                <PricingPlanActions pkgId={pkg.id} price={pkg.price} popular={popular} />

                {pkg.price > 0 && (
                  <p className="mt-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    7-day money-back guarantee
                  </p>
                )}

                <ul className="mt-8 space-y-4">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <Check className={`mt-0.5 h-5 w-5 shrink-0 ${popular ? 'text-indigo-500' : 'text-emerald-500'}`} />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* What you unlock */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">What Premium unlocks</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Free shows you what exists. Premium shows you why it matters.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GATED_AREAS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:border-indigo-500/50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white md:text-4xl mb-12">
            Compare plans
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-5 font-semibold text-slate-900 dark:text-white">Feature</th>
                    <th className="px-6 py-5 text-center font-semibold text-slate-900 dark:text-white">Free</th>
                    <th className="px-6 py-5 text-center font-bold text-indigo-600 dark:text-indigo-400">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {[
                    ["Company directory browsing", true, true],
                    ["Basic company profile", true, true],
                    ["Funding rounds & valuations", false, true],
                    ["Investor & cap table details", false, true],
                    ["Compare companies (up to 4)", false, true],
                    ["CSV exports", false, true],
                    ["Email alerts", false, true],
                    ["Priority support", false, true],
                  ].map(([label, free, pro], i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{label as string}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof free === "boolean" ? (
                          free ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <span className="text-slate-400 dark:text-slate-600">—</span>
                        ) : <span className="text-slate-900 dark:text-white">{free}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof pro === "boolean" ? (
                          pro ? <Check className="mx-auto h-5 w-5 text-indigo-600 dark:text-indigo-400" /> : <span className="text-slate-400 dark:text-slate-600">—</span>
                        ) : <span className="font-bold text-indigo-600 dark:text-indigo-400">{pro}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-900/20 p-10 text-center md:p-16 shadow-lg">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
            Ready to go deeper?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Join the analysts, founders, and investors using InvesTrack Premium to navigate the Lao market.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#plans"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
            >
              Start your Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/companies"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Keep exploring free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { Package } from '@/lib/types'
import { fetchPackages } from '@/lib/api'
import PackageCard from '@/components/cards/PackageCard'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the right plan to access comprehensive data on the Lao startup ecosystem.',
}

export default async function PricingPage() {
  let pkgList: Package[] = []
  
  try {
    pkgList = await fetchPackages()
  } catch (error) {
    console.error('Failed to fetch packages:', error)
  }

  // Sort packages by price
  pkgList.sort((a, b) => a.price - b.price)
  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-indigo-100/80 leading-relaxed max-w-2xl mx-auto">
            Get the data and insights you need to navigate the Lao startup ecosystem. Transparent pricing for everyone.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32 relative z-20 mb-24">
          {pkgList.map((pkg, idx) => (
            <div key={pkg.id} className="w-full">
              <PackageCard 
                pkg={pkg} 
                isPopular={pkg.name.toLowerCase() === 'premium' || pkg.name.toLowerCase() === 'pro' || idx === 1} 
              />
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900">
                What's included in the Basic plan?
                <span className="ml-6 flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-open:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-500 group-open:text-indigo-600 faq-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-slate-600 leading-relaxed">
                The Basic plan gives you free access to browse the public directory of startups and investors in Laos. You can view basic company profiles, general funding history, and use standard search filters.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900">
                Can I upgrade my plan later?
                <span className="ml-6 flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-open:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-500 group-open:text-indigo-600 faq-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-slate-600 leading-relaxed">
                Yes, absolutely. You can upgrade from the Basic plan to Premium at any time from your account dashboard. You will get immediate access to all premium features including contact information and data exports.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900">
                What payment methods do you accept?
                <span className="ml-6 flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-open:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-500 group-open:text-indigo-600 faq-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-slate-600 leading-relaxed">
                We accept major credit/debit cards (Visa, Mastercard) as well as local payment methods via BCEL OnePay QR code scanning for users in Laos.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900">
                Is there a refund policy?
                <span className="ml-6 flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-open:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-500 group-open:text-indigo-600 faq-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-slate-600 leading-relaxed">
                We offer a 7-day money-back guarantee for your first payment. If you're not satisfied with the Premium plan features, contact our support team within 7 days for a full refund.
              </div>
            </details>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <section className="bg-slate-50 border-t border-slate-200/60 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Start Exploring Today</h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">
          Join thousands of entrepreneurs, investors, and enthusiasts who use InvesTrack to stay updated on the Lao startup scene.
        </p>
        <Link 
          href="/signup" 
          className="inline-flex px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:opacity-90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  )
}

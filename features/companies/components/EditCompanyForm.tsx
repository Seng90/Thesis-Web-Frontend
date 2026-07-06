'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  X, 
  Briefcase, 
  MapPin, 
  Globe, 
  Mail, 
  Users, 
  Sparkles, 
  Save, 
  Loader2, 
  AlertCircle 
} from 'lucide-react'
import CompanyLogo from '@/components/ui/CompanyLogo'
import { getImageUrl, getNameColor } from '@/lib/utils'
import type { FounderWithRole } from '@/lib/types'

// Facebook Icon SVG
const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

// LinkedIn Icon SVG
const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

interface EditCompanyFormProps {
  originalCompany: any
  submitting: boolean
  error: string | null
  uploadingLogo: boolean
  uploadingAvatar: Record<string, boolean>
  name: string
  setName: (v: string) => void
  description: string
  setDescription: (v: string) => void
  industry: string
  setIndustry: (v: string) => void
  location: string
  setLocation: (v: string) => void
  contactEmail: string
  setContactEmail: (v: string) => void
  websiteUrl: string
  setWebsiteUrl: (v: string) => void
  facebookUrl: string
  setFacebookUrl: (v: string) => void
  linkedinUrl: string
  setLinkedinUrl: (v: string) => void
  employeeCount: string
  setEmployeeCount: (v: string) => void
  headquartersAddress: string
  setHeadquartersAddress: (v: string) => void
  keyProducts: string[]
  productInput: string
  keyPartners: string[]
  partnerInput: string
  logoUrl: string | null
  founders: (FounderWithRole & { isNew?: boolean; tempId?: string })[]
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>, founderId: string) => void
  handleProductInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePartnerInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addProductTag: () => void
  removeProductTag: (index: number) => void
  addPartnerTag: () => void
  removePartnerTag: (index: number) => void
  updateFounderField: (id: string, field: keyof FounderWithRole | 'nameEn' | 'nameLa', value: any) => void
  addNewFounder: () => void
  removeFounder: (id: string) => void
  handleSubmit: (e: React.FormEvent) => void
}

export default function EditCompanyForm({
  originalCompany,
  submitting,
  error,
  uploadingLogo,
  uploadingAvatar,
  name,
  setName,
  description,
  setDescription,
  industry,
  setIndustry,
  location,
  setLocation,
  contactEmail,
  setContactEmail,
  websiteUrl,
  setWebsiteUrl,
  facebookUrl,
  setFacebookUrl,
  linkedinUrl,
  setLinkedinUrl,
  employeeCount,
  setEmployeeCount,
  headquartersAddress,
  setHeadquartersAddress,
  keyProducts,
  productInput,
  keyPartners,
  partnerInput,
  logoUrl,
  founders,
  handleLogoUpload,
  handleAvatarUpload,
  handleProductInputChange,
  handlePartnerInputChange,
  addProductTag,
  removeProductTag,
  addPartnerTag,
  removePartnerTag,
  updateFounderField,
  addNewFounder,
  removeFounder,
  handleSubmit
}: EditCompanyFormProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const avatarRefs = useRef<Record<string, HTMLInputElement | null>>({})

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/dashboard/my-companies" 
          className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to My Companies
        </Link>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
          {/* Header Card / Banner */}
          <div className="relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Banner Cover */}
            <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-8 pb-8 pt-4 flex flex-col md:flex-row md:items-end gap-6 relative">
              {/* Overlapping Logo */}
              <div className="-mt-16 relative group/logo shrink-0">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-surface-900 shadow-md bg-white flex items-center justify-center">
                  <CompanyLogo logoUrl={logoUrl} name={name} size="lg" />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl shadow-md transition-all cursor-pointer"
                  title="Upload Logo"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0 md:mb-2">
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight truncate">
                  Edit {originalCompany?.name}
                </h1>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Request changes to your company profile. Revisions are subject to administrator approval.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-end md:mb-2 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex gap-3 text-error text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Request failed:</span> {error}
              </div>
            </div>
          )}

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Col: Main Details (col-span-2) */}
            <div className="md:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-100 dark:border-surface-800">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">About Company</h2>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-name" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Company Name</label>
                    <input 
                      type="text" 
                      id="company-name"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. InvesTrack Corp"
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-desc" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Description</label>
                    <textarea 
                      id="company-desc"
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Describe what your company does, your mission, products..."
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Industry */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="company-industry" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Industry</label>
                      <input 
                        type="text" 
                        id="company-industry"
                        value={industry} 
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. FinTech, SaaS"
                        className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                    </div>

                    {/* Employee Count */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="company-employees" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Employee Count</label>
                      <input 
                        type="text" 
                        id="company-employees"
                        value={employeeCount} 
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        placeholder="e.g. 11-50 employees"
                        className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag Fields (Key Products & Partners) */}
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-100 dark:border-surface-800">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Products & Partners</h2>
                </div>

                <div className="space-y-6">
                  {/* Key Products */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Key Products</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={productInput}
                        onChange={handleProductInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProductTag())}
                        placeholder="Add key product and press enter"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                      <button 
                        type="button"
                        onClick={addProductTag}
                        className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keyProducts.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => removeProductTag(idx)} 
                            className="text-surface-400 hover:text-surface-600 dark:hover:text-white shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Partners */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Key Partners</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={partnerInput}
                        onChange={handlePartnerInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPartnerTag())}
                        placeholder="Add key partner and press enter"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                      <button 
                        type="button"
                        onClick={addPartnerTag}
                        className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keyPartners.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => removePartnerTag(idx)} 
                            className="text-surface-400 hover:text-surface-600 dark:hover:text-white shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Logistics & Links */}
            <div className="space-y-8">
              {/* Logistics & Location */}
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-100 dark:border-surface-800">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Logistics</h2>
                </div>

                <div className="space-y-4">
                  {/* Location (City/Country) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-location" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Location (City/Country)</label>
                    <input 
                      type="text" 
                      id="company-location"
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Vientiane, Laos"
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* Headquarters Address */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-hq" className="text-sm font-semibold text-surface-700 dark:text-surface-300">Headquarters Address</label>
                    <textarea 
                      id="company-hq"
                      value={headquartersAddress} 
                      onChange={(e) => setHeadquartersAddress(e.target.value)}
                      rows={3}
                      placeholder="Full physical address..."
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Links & Contact */}
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-100 dark:border-surface-800">
                  <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Links & Contact</h2>
                </div>

                <div className="space-y-4">
                  {/* Contact Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-email" className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-surface-400" /> Contact Email
                    </label>
                    <input 
                      type="email" 
                      id="company-email"
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="info@company.com"
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* Website URL */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-website" className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-surface-400" /> Website URL
                    </label>
                    <input 
                      type="url" 
                      id="company-website"
                      value={websiteUrl} 
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://company.com"
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-linkedin" className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-1">
                      <LinkedInIcon className="w-3.5 h-3.5 text-surface-400" /> LinkedIn Profile
                    </label>
                    <input 
                      type="url" 
                      id="company-linkedin"
                      value={linkedinUrl} 
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* Facebook URL */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company-facebook" className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-1">
                      <FacebookIcon className="w-3.5 h-3.5 text-surface-400" /> Facebook Page
                    </label>
                    <input 
                      type="url" 
                      id="company-facebook"
                      value={facebookUrl} 
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Founding Team Section (Full Width) */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Founding Team</h2>
              </div>

              <button
                type="button"
                onClick={addNewFounder}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Founder
              </button>
            </div>

            {founders.length === 0 ? (
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-6">
                No founders defined. Click &quot;Add Founder&quot; to build your founding team list.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {founders.map((founder) => {
                  const founderId = founder.id || founder.tempId || ''
                  return (
                    <div 
                      key={founderId}
                      className="relative border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30 rounded-2xl p-6 space-y-4 group/founder"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFounder(founderId)}
                        className="absolute top-4 right-4 text-surface-400 hover:text-error dark:hover:text-error p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors cursor-pointer"
                        title="Remove Founder"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Header (Avatar & Name/Role Edit) */}
                      <div className="flex gap-4 items-start">
                        {/* Avatar Upload */}
                        <div className="relative group/avatar shrink-0">
                          <div className="w-16 h-16 rounded-full overflow-hidden border border-surface-200 dark:border-surface-800 bg-white flex items-center justify-center">
                            {founder.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={getImageUrl(founder.avatarUrl)} 
                                alt={founder.nameEn || founder.nameLa || 'Founder'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${getNameColor(founder.nameEn || founder.nameLa || 'F')} flex items-center justify-center text-white font-bold text-lg`}>
                                {(founder.nameEn || founder.nameLa || 'F').charAt(0).toUpperCase()}
                              </div>
                            )}
                            {uploadingAvatar[founderId] && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const el = avatarRefs.current[founderId]
                              if (el) el.click()
                            }}
                            className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-1.5 rounded-full shadow-md hover:bg-primary-700 transition-colors cursor-pointer"
                          >
                            <Upload className="w-2.5 h-2.5" />
                          </button>
                          
                          <input
                            type="file"
                            ref={el => { avatarRefs.current[founderId] = el }}
                            onChange={(e) => handleAvatarUpload(e, founderId)}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>

                        {/* Name & Role Inputs */}
                        <div className="flex-1 space-y-2 min-w-0 pr-6">
                          <input 
                            type="text"
                            value={founder.nameEn}
                            onChange={(e) => updateFounderField(founderId, 'nameEn', e.target.value)}
                            placeholder="Name (English)"
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <input 
                            type="text"
                            value={founder.nameLa}
                            onChange={(e) => updateFounderField(founderId, 'nameLa', e.target.value)}
                            placeholder="Name (Lao)"
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <input 
                            type="text"
                            value={founder.role}
                            onChange={(e) => updateFounderField(founderId, 'role', e.target.value)}
                            placeholder="Role (e.g. Co-Founder & CEO)"
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Bio</label>
                        <textarea 
                          value={founder.bio || ''}
                          onChange={(e) => updateFounderField(founderId, 'bio', e.target.value)}
                          placeholder="Brief founder bio..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {/* LinkedIn */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">LinkedIn URL</label>
                        <input 
                          type="url"
                          value={founder.linkedinUrl || ''}
                          onChange={(e) => updateFounderField(founderId, 'linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}

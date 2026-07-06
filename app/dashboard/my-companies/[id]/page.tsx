'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, hasPermission } from '@/lib/auth'
import { fetchCompany, requestCompanyRevision, uploadImage } from '@/lib/api'
import { getImageUrl, getNameColor } from '@/lib/utils'
import CompanyLogo from '@/components/ui/CompanyLogo'
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
import type { CompanyWithRelations, FounderWithRole } from '@/lib/types'

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

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = use(params)
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  // States
  const [originalCompany, setOriginalCompany] = useState<CompanyWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Image Uploading States
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState<Record<string, boolean>>({})

  // Form States
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [headquartersAddress, setHeadquartersAddress] = useState('')
  
  // Array/Tag States
  const [keyProducts, setKeyProducts] = useState<string[]>([])
  const [productInput, setProductInput] = useState('')
  const [keyPartners, setKeyPartners] = useState<string[]>([])
  const [partnerInput, setPartnerInput] = useState('')
  
  // Logo State
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  
  // Founders State
  const [founders, setFounders] = useState<(FounderWithRole & { isNew?: boolean; tempId?: string })[]>([])

  // Refs for uploads
  const logoInputRef = useRef<HTMLInputElement>(null)
  const avatarRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load Data
  useEffect(() => {
    if (authLoading) return
    
    // Auth Guard
    if (!user || !hasPermission(user, 'read:own-managed-companies')) {
      setLoading(false)
      return
    }

    async function loadCompanyData() {
      try {
        setLoading(true)
        if (!token) return
        const data = await fetchCompany(companyId)
        if (!data) {
          setError('Company not found or you do not have permission to view it.')
          return
        }
        
        setOriginalCompany(data)
        
        // Initialize form states
        setName(data.name || '')
        setDescription(data.description || '')
        setIndustry(data.industry || '')
        setLocation(data.location || '')
        setContactEmail(data.contactEmail || '')
        setWebsiteUrl(data.websiteUrl || '')
        setFacebookUrl(data.facebookUrl || '')
        setLinkedinUrl(data.linkedinUrl || '')
        setEmployeeCount(data.employeeCount || '')
        setHeadquartersAddress(data.headquartersAddress || '')
        setKeyProducts(data.keyProducts || [])
        setKeyPartners(data.keyPartners || [])
        setLogoUrl(data.logoUrl || null)
        setFounders(data.founders || [])
      } catch (err: any) {
        console.error('[EditCompanyPage] Load error:', err)
        setError(err.message || 'Failed to load company details.')
      } finally {
        setLoading(false)
      }
    }

    loadCompanyData()
  }, [companyId, token, user, authLoading])

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    try {
      setUploadingLogo(true)
      const url = await uploadImage(file, token)
      setLogoUrl(url)
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle Founder Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, founderId: string) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    try {
      setUploadingAvatar(prev => ({ ...prev, [founderId]: true }))
      const url = await uploadImage(file, token)
      setFounders(prev => prev.map(f => {
        const idToCheck = f.id || f.tempId
        if (idToCheck === founderId) {
          return { ...f, avatarUrl: url }
        }
        return f
      }))
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(prev => ({ ...prev, [founderId]: false }))
    }
  }

  // Handle Add Product Tag
  const addProductTag = () => {
    if (productInput.trim() && !keyProducts.includes(productInput.trim())) {
      setKeyProducts([...keyProducts, productInput.trim()])
      setProductInput('')
    }
  }

  // Handle Remove Product Tag
  const removeProductTag = (index: number) => {
    setKeyProducts(keyProducts.filter((_, i) => i !== index))
  }

  // Handle Add Partner Tag
  const addPartnerTag = () => {
    if (partnerInput.trim() && !keyPartners.includes(partnerInput.trim())) {
      setKeyPartners([...keyPartners, partnerInput.trim()])
      setPartnerInput('')
    }
  }

  // Handle Remove Partner Tag
  const removePartnerTag = (index: number) => {
    setKeyPartners(keyPartners.filter((_, i) => i !== index))
  }

  // Founder updates
  const updateFounderField = (id: string, field: keyof FounderWithRole | 'nameEn' | 'nameLa', value: any) => {
    setFounders(prev => prev.map(f => {
      const idToCheck = f.id || f.tempId
      if (idToCheck === id) {
        return { ...f, [field]: value }
      }
      return f
    }))
  }

  // Add new founder
  const addNewFounder = () => {
    const tempId = `temp-${Date.now()}`
    const newFounder: FounderWithRole & { isNew: boolean; tempId: string } = {
      id: '',
      tempId,
      nameEn: '',
      nameLa: '',
      bio: '',
      role: '',
      linkedinUrl: '',
      isActive: true,
      isNew: true,
      createdAt: '',
      updatedAt: ''
    }
    setFounders([...founders, newFounder])
  }

  // Remove founder
  const removeFounder = (id: string) => {
    setFounders(founders.filter(f => (f.id || f.tempId) !== id))
  }

  // Form Submit / Request Revision
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalCompany || !token) return

    setSubmitting(true)
    setError(null)

    // Build proposed changes diff
    const proposedChanges: Record<string, any> = {}

    if (name !== (originalCompany.name || '')) proposedChanges.name = name
    if (description !== (originalCompany.description || '')) proposedChanges.description = description
    if (industry !== (originalCompany.industry || '')) proposedChanges.industry = industry
    if (location !== (originalCompany.location || '')) proposedChanges.location = location
    if (contactEmail !== (originalCompany.contactEmail || '')) proposedChanges.contact_email = contactEmail
    if (websiteUrl !== (originalCompany.websiteUrl || '')) proposedChanges.website_url = websiteUrl
    if (facebookUrl !== (originalCompany.facebookUrl || '')) proposedChanges.facebook_url = facebookUrl
    if (linkedinUrl !== (originalCompany.linkedinUrl || '')) proposedChanges.linkedin_url = linkedinUrl
    if (employeeCount !== (originalCompany.employeeCount || '')) proposedChanges.employee_count = employeeCount
    if (headquartersAddress !== (originalCompany.headquartersAddress || '')) proposedChanges.headquarters_address = headquartersAddress
    if (logoUrl !== (originalCompany.logoUrl || null)) proposedChanges.logo_url = logoUrl
    
    // Arrays comparison
    if (JSON.stringify(keyProducts) !== JSON.stringify(originalCompany.keyProducts || [])) {
      proposedChanges.key_products = keyProducts
    }
    if (JSON.stringify(keyPartners) !== JSON.stringify(originalCompany.keyPartners || [])) {
      proposedChanges.key_partners = keyPartners
    }

    // Founders diff/array comparison
    const cleanedFounders = founders.map(f => ({
      id: f.isNew ? undefined : f.id,
      name_en: f.nameEn,
      name_la: f.nameLa,
      bio: f.bio || null,
      role: f.role,
      linkedin_url: f.linkedinUrl || null,
      avatar_url: f.avatarUrl || null,
      is_active: f.isActive
    }))

    const originalCleanedFounders = (originalCompany.founders || []).map(f => ({
      id: f.id,
      name_en: f.nameEn,
      name_la: f.nameLa,
      bio: f.bio || null,
      role: f.role,
      linkedin_url: f.linkedinUrl || null,
      avatar_url: f.avatarUrl || null,
      is_active: f.isActive
    }))

    if (JSON.stringify(cleanedFounders) !== JSON.stringify(originalCleanedFounders)) {
      proposedChanges.founders = cleanedFounders
    }

    if (Object.keys(proposedChanges).length === 0) {
      setError('No changes detected. Please modify fields before requesting a revision.')
      setSubmitting(false)
      return
    }

    try {
      await requestCompanyRevision(companyId, proposedChanges, token)
      router.push('/dashboard/my-revisions')
    } catch (err: any) {
      console.error('[EditCompanyPage] Submit error:', err)
      setError(err.message || 'Failed to request revision.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-surface-500 dark:text-surface-400">Loading company details...</p>
        </div>
      </div>
    )
  }

  // Access Denied / Auth Error State
  if (!user || !hasPermission(user, 'read:own-managed-companies')) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            You must be logged in as a Founder to request edits for your company profile.
          </p>
          <Link href="/login" className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (error && !originalCompany) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Error</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{error}</p>
          <Link href="/dashboard/my-companies" className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all">
            Back to My Companies
          </Link>
        </div>
      </div>
    )
  }

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
                        onChange={(e) => setProductInput(e.target.value)}
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
                        onChange={(e) => setPartnerInput(e.target.value)}
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
                            onClick={() => avatarRefs.current[founderId]?.click()}
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

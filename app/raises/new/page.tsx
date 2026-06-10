'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Building2, Save, FileText, LayoutList, Target, Calendar, Tag, Link2, Mail, Loader2, ImagePlus, UploadCloud } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Company {
  id: string
  name: string
}

export default function PostRaisePage() {
  const { user, token, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    excerpt: '',
    content: '',
    roundType: 'Seed',
    targetAmountUsd: '',
    minTicketUsd: '',
    deadline: '',
    contactEmail: '',
    websiteUrl: '',
    pitchDeckUrl: '',
    tags: '',
    coverUrl: '',
  })

  // Auth Guard: Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/raises/new')
    }
  }, [user, isAuthLoading, router])

  // Fetch Companies
  useEffect(() => {
    async function fetchCompanies() {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/user/companies/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setCompanies(data)
        }
      } catch (err) {
        console.error('Failed to fetch companies', err)
      } finally {
        setIsCompaniesLoading(false)
      }
    }
    fetchCompanies()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: uploadData,
        // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      setFormData(prev => ({ ...prev, coverUrl: data.url }))
    } catch (err) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsLoading(true)
    setError('')

    try {
      // Format payload (numbers, tags)
      const payload = {
        company_id: formData.companyId,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        round_type: formData.roundType,
        target_amount_usd: Number(formData.targetAmountUsd),
        min_ticket_usd: Number(formData.minTicketUsd),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        contact_email: formData.contactEmail,
        website_url: formData.websiteUrl,
        pitch_deck_url: formData.pitchDeckUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        cover_url: formData.coverUrl
      }

      const res = await fetch(`${API_BASE}/user/fundraising-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create post')
      }

      setSuccess(true)

      setTimeout(() => {
        router.refresh() // Invalidate cache
        router.push('/raises')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <Save className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Post Created Successfully!</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Redirecting you to the raises page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Post a Raise</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Share your startup's fundraising round with our investor network.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          
          {/* Card: Basic Info */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Company
                </label>
                <select
                  name="companyId"
                  required
                  value={formData.companyId}
                  onChange={handleChange}
                  disabled={isCompaniesLoading}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isCompaniesLoading ? 'Loading companies...' : 'Select a company'}
                  </option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {!isCompaniesLoading && companies.length === 0 && (
                  <p className="mt-1.5 text-xs text-red-500">You do not have any approved companies yet.</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <LayoutList className="h-4 w-4" /> Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Seed Round to expand across Southeast Asia"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Short Excerpt
                </label>
                <textarea
                  name="excerpt"
                  required
                  rows={2}
                  placeholder="A brief 1-2 sentence summary of your round."
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Story
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  placeholder="Tell investors why they should invest, your traction, and how you will use the funds."
                  value={formData.content}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

            </div>
          </div>

          {/* Card: Funding Details */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Funding Details
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Round Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Round Type
                </label>
                <select
                  name="roundType"
                  required
                  value={formData.roundType}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Pre-Series A">Pre-Series A</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Debt">Debt Financing</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Amount (USD)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-slate-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="targetAmountUsd"
                    required
                    min="0"
                    placeholder="500000"
                    value={formData.targetAmountUsd}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-8 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Min Ticket */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Min Ticket Size (USD)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-slate-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="minTicketUsd"
                    required
                    min="0"
                    placeholder="25000"
                    value={formData.minTicketUsd}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-8 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Card: Media & Links */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="h-5 w-5 text-indigo-500" />
                Media & Links
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4" /> Cover Image
                </label>
                
                <div className="mt-2 flex items-center gap-4">
                  {formData.coverUrl && (
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.coverUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 py-4 px-6 transition-colors">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                          <span className="text-sm font-medium text-slate-500">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-5 w-5 text-indigo-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload an image</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pitch Deck */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pitch Deck URL (Optional)
                </label>
                <input
                  type="url"
                  name="pitchDeckUrl"
                  placeholder="https://docsend.com/view/..."
                  value={formData.pitchDeckUrl}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    placeholder="https://yourcompany.la"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    placeholder="founder@yourcompany.la"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="h-4 w-4" /> Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g. Fintech, Mobile, B2B"
                  value={formData.tags}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1.5 text-xs text-slate-500">Separate multiple tags with commas.</p>
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || isUploading || (companies.length === 0 && !isCompaniesLoading)}
              className="inline-flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Publish Post
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

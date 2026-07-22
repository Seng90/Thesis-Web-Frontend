'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Building2, Save, FileText, LayoutList, Target, Calendar, Clock, Tag, Link2, Mail, Loader2, ImagePlus, UploadCloud, AlertCircle, RefreshCw } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import RoundTypeSelect from '@/components/raises/RoundTypeSelect'
import { fetchFundraisingPostBySlug, updateFundraisingPost, repostFundraisingPost } from '@/features/raises/api/raisesApi'
import type { FundraisingPost } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function EditRaisePage() {
  const { user, token, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<FundraisingPost | null>(null)
  const [isPostLoading, setIsPostLoading] = useState(true)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
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
    fundraisingDate: '',
    startTime: '09:00',
    endTime: '17:00',
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



  // Fetch Existing Post Data
  useEffect(() => {
    async function loadPost() {
      if (!slug) return
      try {
        const data = await fetchFundraisingPostBySlug(slug)
        if (data) {
          setPost(data)
          
          // Pre-fill form
          const dateObj = data.startDate ? new Date(data.startDate) : new Date(data.publishedAt)
          const deadlineObj = new Date(data.deadline)
          
          setFormData({
            companyId: data.companyId || '', // Note: type might not have company_id, so we assume backend sends it or we just disable company change
            title: data.title,
            excerpt: data.excerpt,
            content: data.content || '',
            roundType: data.roundType,
            targetAmountUsd: data.targetAmountUsd.toString(),
            minTicketUsd: data.minTicketUsd?.toString() || '',
            fundraisingDate: dateObj.toISOString().split('T')[0],
            startTime: dateObj.toTimeString().substring(0, 5),
            endTime: deadlineObj.toTimeString().substring(0, 5),
            contactEmail: data.contactEmail || '',
            websiteUrl: data.websiteUrl || '',
            pitchDeckUrl: data.pitchDeckUrl || '',
            tags: data.tags.join(', '),
            coverUrl: data.coverUrl || '',
          })
        } else {
          setError('Post not found')
        }
      } catch {
        setError('Failed to load post')
      } finally {
        setIsPostLoading(false)
      }
    }
    loadPost()
  }, [slug])

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

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers,
        body: uploadData,
        // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      setFormData(prev => ({ ...prev, coverUrl: data.url }))
    } catch {
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

    if (!formData.companyId) {
      setError('Please select a company')
      setIsLoading(false)
      return
    }

    try {
      // Format payload (numbers, tags)
      const payload: Record<string, unknown> = {
        company_id: formData.companyId,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        round_type: formData.roundType,
        target_amount_usd: Number(formData.targetAmountUsd),
        min_ticket_usd: Number(formData.minTicketUsd),
        start_date: formData.fundraisingDate && formData.startTime
          ? new Date(`${formData.fundraisingDate}T${formData.startTime}:00`).toISOString()
          : undefined,
        deadline: formData.fundraisingDate && formData.endTime
          ? new Date(`${formData.fundraisingDate}T${formData.endTime}:00`).toISOString()
          : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      // Attach optional fields if not empty
      if (formData.contactEmail) payload.contact_email = formData.contactEmail
      if (formData.websiteUrl) payload.website_url = formData.websiteUrl
      if (formData.pitchDeckUrl) payload.pitch_deck_url = formData.pitchDeckUrl
      if (formData.coverUrl) payload.cover_url = formData.coverUrl

      await updateFundraisingPost(post!.id, token, payload)

      setSuccess(true)

      setTimeout(() => {
        router.refresh()
        router.push(`/raises/${slug}`)
      }, 2000)

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const handleRepost = async () => {
    if (!token || !post) return
    setIsReposting(true)
    setError('')
    try {
      // First save changes
      const payload: Record<string, unknown> = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        round_type: formData.roundType,
        target_amount_usd: Number(formData.targetAmountUsd),
        min_ticket_usd: Number(formData.minTicketUsd),
        start_date: formData.fundraisingDate && formData.startTime
          ? new Date(`${formData.fundraisingDate}T${formData.startTime}:00`).toISOString()
          : undefined,
        deadline: formData.fundraisingDate && formData.endTime
          ? new Date(`${formData.fundraisingDate}T${formData.endTime}:00`).toISOString()
          : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        contact_email: formData.contactEmail,
        website_url: formData.websiteUrl,
        pitch_deck_url: formData.pitchDeckUrl,
        cover_url: formData.coverUrl
      }
      await updateFundraisingPost(post.id, token, payload)
      
      // Then repost
      await repostFundraisingPost(post.id, token)

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        router.push(`/raises/${slug}`)
      }, 2000)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to repost'
      setError(errorMsg)
      setIsReposting(false)
    }
  }

  // Show loading state while checking auth
  if (isAuthLoading || !user || isPostLoading) {
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Post</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Update your fundraising round information.
          </p>
        </div>

        {post?.status === 'Hidden' && post.adminFeedback && (
          <div className="mb-8 rounded-xl bg-orange-50 border border-orange-200 p-5 dark:bg-orange-500/10 dark:border-orange-500/20 shadow-sm">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Action Required (Post Hidden)</h3>
                <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                  {post.adminFeedback}
                </p>
                <p className="mt-3 text-xs text-orange-600/80 dark:text-orange-400/80">
                  Make the requested changes below and click <strong>&quot;Save &amp; Repost&quot;</strong> to publish your round again.
                </p>
              </div>
            </div>
          </div>
        )}

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
                  disabled={true} // Cannot change company after creation
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-3 text-slate-900 dark:text-white shadow-sm sm:text-sm opacity-70 cursor-not-allowed"
                >
                  <option value={formData.companyId}>{post?.companyName || 'Loading...'}</option>
                </select>

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
                  maxLength={255}
                  placeholder="e.g. Seed Round to expand across Southeast Asia"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {formData.title.length >= 255 && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> ຂໍ້ຄວາມຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 255 ຕົວອັກສອນ)
                  </p>
                )}
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
                  maxLength={500}
                  placeholder="A brief 1-2 sentence summary of your round."
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {formData.excerpt.length >= 500 && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> ຂໍ້ຄວາມຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 500 ຕົວອັກສອນ)
                  </p>
                )}
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
                  maxLength={10000}
                  placeholder="Tell investors why they should invest, your traction, and how you will use the funds."
                  value={formData.content}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {formData.content.length >= 10000 && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> ຂໍ້ຄວາມຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 10,000 ຕົວອັກສອນ)
                  </p>
                )}
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
                <RoundTypeSelect 
                  value={formData.roundType} 
                  onChange={(val) => setFormData(prev => ({ ...prev, roundType: val }))} 
                />
              </div>

              {/* Fundraising Schedule — Full Width */}
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fundraising Schedule</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose the date and set your start &amp; end time</p>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="fundraisingDate"
                    required
                    value={formData.fundraisingDate}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-4 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  {/* Start Time */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      <Clock className="h-3.5 w-3.5" /> Start
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      required
                      value={formData.startTime}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-4 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                    />
                  </div>

                  {/* Arrow Connector */}
                  <div className="flex flex-col items-center pb-3 gap-1">
                    <div className="h-px w-8 bg-gradient-to-r from-indigo-400 to-violet-400 dark:from-indigo-500 dark:to-violet-500 rounded-full"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">to</span>
                    <div className="h-px w-8 bg-gradient-to-r from-violet-400 to-indigo-400 dark:from-violet-500 dark:to-indigo-500 rounded-full"></div>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      <Clock className="h-3.5 w-3.5" /> End
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      required
                      value={formData.endTime}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-4 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                    />
                  </div>
                </div>

                {/* Visual Timeline */}
                {formData.fundraisingDate && (
                  <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-indigo-500/10">
                    <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                        style={{
                          left: `${(parseInt(formData.startTime.split(':')[0]) / 24) * 100}%`,
                          right: `${100 - (parseInt(formData.endTime.split(':')[0]) / 24) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {new Date(`${formData.fundraisingDate}T${formData.startTime}`).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                        {new Date(`${formData.fundraisingDate}T${formData.endTime}`).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">

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
                      <img src={getImageUrl(formData.coverUrl)} alt="Preview" className="h-full w-full object-cover" />
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
                  maxLength={255}
                  placeholder="https://docsend.com/view/..."
                  value={formData.pitchDeckUrl}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {formData.pitchDeckUrl.length >= 255 && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> URL ຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 255 ຕົວອັກສອນ)
                  </p>
                )}
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
                    maxLength={255}
                    placeholder="https://yourcompany.la"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {formData.websiteUrl.length >= 255 && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> URL ຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 255 ຕົວອັກສອນ)
                    </p>
                  )}
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
                    maxLength={255}
                    placeholder="founder@yourcompany.la"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {formData.contactEmail.length >= 255 && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> ອີເມວຍາວເກີນກຳນົດແລ້ວ (ສູງສຸດ 255 ຕົວອັກສອນ)
                    </p>
                  )}
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

          {/* Admin Feedback */}
          {post?.adminFeedback && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-amber-800 dark:text-amber-200">
              <h3 className="font-semibold mb-1">Admin Feedback</h3>
              <p className="text-sm opacity-90">{post.adminFeedback}</p>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isReposting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
            
            {post?.status === 'Hidden' && (
              <button
                type="button"
                onClick={handleRepost}
                disabled={isLoading || isReposting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl disabled:opacity-70"
              >
                {isReposting ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                Save &amp; Repost
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}

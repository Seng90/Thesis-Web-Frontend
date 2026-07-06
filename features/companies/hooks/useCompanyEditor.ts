'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, hasPermission } from '@/lib/auth'
import { fetchCompany, requestCompanyRevision, uploadImage } from '../api/companiesApi'
import type { CompanyWithRelations, FounderWithRole } from '@/lib/types'

export function useCompanyEditor(companyId: string) {
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

  // Load Data
  useEffect(() => {
    if (authLoading) return
    
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
        console.error('[useCompanyEditor] Load error:', err)
        setError(err.message || 'Failed to load company details.')
      } finally {
        setLoading(false)
      }
    }

    loadCompanyData()
  }, [companyId, token, user, authLoading])

  // Handle Logo Upload
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [token])

  // Handle Founder Avatar Upload
  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, founderId: string) => {
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
  }, [token])

  // Handlers for Tag Inputs
  const handleProductInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProductInput(e.target.value)
  }, [])

  const handlePartnerInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerInput(e.target.value)
  }, [])

  const addProductTag = useCallback(() => {
    if (productInput.trim() && !keyProducts.includes(productInput.trim())) {
      setKeyProducts(prev => [...prev, productInput.trim()])
      setProductInput('')
    }
  }, [productInput, keyProducts])

  const removeProductTag = useCallback((index: number) => {
    setKeyProducts(prev => prev.filter((_, i) => i !== index))
  }, [])

  const addPartnerTag = useCallback(() => {
    if (partnerInput.trim() && !keyPartners.includes(partnerInput.trim())) {
      setKeyPartners(prev => [...prev, partnerInput.trim()])
      setPartnerInput('')
    }
  }, [partnerInput, keyPartners])

  const removePartnerTag = useCallback((index: number) => {
    setKeyPartners(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateFounderField = useCallback((id: string, field: keyof FounderWithRole | 'nameEn' | 'nameLa', value: any) => {
    setFounders(prev => prev.map(f => {
      const idToCheck = f.id || f.tempId
      if (idToCheck === id) {
        return { ...f, [field]: value }
      }
      return f
    }))
  }, [])

  const addNewFounder = useCallback(() => {
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
    setFounders(prev => [...prev, newFounder])
  }, [])

  const removeFounder = useCallback((id: string) => {
    setFounders(prev => prev.filter(f => (f.id || f.tempId) !== id))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalCompany || !token) return

    setSubmitting(true)
    setError(null)

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
    
    if (JSON.stringify(keyProducts) !== JSON.stringify(originalCompany.keyProducts || [])) {
      proposedChanges.key_products = keyProducts
    }
    if (JSON.stringify(keyPartners) !== JSON.stringify(originalCompany.keyPartners || [])) {
      proposedChanges.key_partners = keyPartners
    }

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
      setError(err.message || 'Failed to submit changes.')
      setSubmitting(false)
    }
  }, [
    originalCompany, token, name, description, industry, location, contactEmail,
    websiteUrl, facebookUrl, linkedinUrl, employeeCount, headquartersAddress,
    logoUrl, keyProducts, keyPartners, founders, companyId, router
  ])

  return {
    user,
    token,
    authLoading,
    originalCompany,
    loading,
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
  }
}

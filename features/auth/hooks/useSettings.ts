'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type AuthUser } from '@/lib/auth'
import { API_BASE } from '@/lib/apiClient'
import { fetchProfile, updateProfile } from '../api/authApi'

export type Tab = 'profile' | 'security' | 'preferences'

export function useSettings() {
  const { user, token, isLoading: isAuthLoading, updateUser } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isFetchingProfile, setIsFetchingProfile] = useState(true)

  // Profile Form State
  const [profileData, setProfileData] = useState({ username: '', email: '', avatarUrl: '', role: '', packageId: '', status: '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  // Security Form State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSavingPass, setIsSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/settings')
    }
  }, [user, isAuthLoading, router])

  // Fetch Profile
  useEffect(() => {
    async function loadProfile() {
      if (!token) return
      try {
        const res = await fetchProfile(token)
        if (res.ok) {
          const data = await res.json()
          setProfileData({
            username: data.username || '',
            email: data.email || '',
            avatarUrl: data.avatarUrl || data.avatar_url || '',
            role: data.roles?.[0] || data.role || 'Member',
            packageId: data.packageId || 'Free Plan',
            status: data.status || 'Active'
          })
          const updatedUserData: Partial<AuthUser> = {
            username: data.username,
            email: data.email,
            avatarUrl: data.avatarUrl || data.avatar_url,
          }
          if (data.role) {
            updatedUserData.role = data.role
          }
          if (data.roles && data.roles.length > 0) {
            updatedUserData.roles = data.roles
            updatedUserData.role = data.roles[0]
          }
          if (data.permissions && data.permissions.length > 0) {
            updatedUserData.permissions = data.permissions
          }
          updateUser(updatedUserData)
        }
      } catch (err) {
        console.error('Failed to fetch profile', err)
      } finally {
        setIsFetchingProfile(false)
      }
    }
    
    if (token) {
      loadProfile()
    }
  }, [token, updateUser])

  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handlePassChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setIsUploadingAvatar(true)
    setProfileMsg({ type: '', text: '' })

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      
      setProfileData(prev => ({ ...prev, avatarUrl: data.url }))
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Failed to upload image' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }, [token])

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSavingProfile(true)
    setProfileMsg({ type: '', text: '' })

    try {
      const res = await updateProfile(token, {
        username: profileData.username,
        avatarUrl: profileData.avatarUrl
      })

      if (!res.ok) throw new Error('Failed to update profile')
      
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
      updateUser({
        username: profileData.username,
        avatarUrl: profileData.avatarUrl
      })
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Something went wrong' })
    } finally {
      setIsSavingProfile(false)
    }
  }, [token, profileData, updateUser])

  const handleSavePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setIsSavingPass(true)
    setPassMsg({ type: '', text: '' })

    try {
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Incorrect current password')
      }
      
      setPassMsg({ type: 'success', text: 'Password changed successfully' })
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message })
    } finally {
      setIsSavingPass(false)
    }
  }, [token, passData])

  return {
    user,
    token,
    isAuthLoading,
    activeTab,
    setActiveTab,
    isFetchingProfile,
    profileData,
    isSavingProfile,
    isUploadingAvatar,
    profileMsg,
    passData,
    isSavingPass,
    passMsg,
    handleProfileChange,
    handlePassChange,
    handleAvatarUpload,
    handleSaveProfile,
    handleSavePassword
  }
}

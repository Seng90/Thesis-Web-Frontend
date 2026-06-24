'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { User, Lock, Bell, Palette, UploadCloud, Loader2, Save, CheckCircle2, AlertCircle, LayoutList } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Tab = 'profile' | 'security' | 'preferences'

export default function SettingsPage() {
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
    async function fetchProfile() {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfileData({
            username: data.username || '',
            email: data.email || '',
            avatarUrl: data.avatarUrl || data.avatar_url || '',
            role: data.role || 'Member',
            packageId: data.packageId || 'Free Plan',
            status: data.status || 'Active'
          })
          // Update global context silently in case avatar changed elsewhere
          updateUser({
            username: data.username,
            email: data.email,
            avatarUrl: data.avatarUrl || data.avatar_url,
            role: data.role
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile', err)
      } finally {
        setIsFetchingProfile(false)
      }
    }
    
    if (token) {
      fetchProfile()
    }
  }, [token, updateUser])

  // --- Handlers ---

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSavingProfile(true)
    setProfileMsg({ type: '', text: '' })

    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      })

      if (!res.ok) throw new Error('Failed to update profile')
      
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
      updateUser(profileData) // Update global state
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Something went wrong' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
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
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-50 dark:bg-surface-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            Manage your profile, security, and preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-white/5'
                }`}
              >
                <Lock className="w-4 h-4" /> Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'preferences'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-white/5'
                }`}
              >
                <Bell className="w-4 h-4" /> Preferences
              </button>
              
              <div className="my-2 border-t border-surface-200 dark:border-white/5"></div>
              
              {user?.role?.toLowerCase() === 'founder' && (
                <Link
                  href="/raises/my-posts"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-white/5"
                >
                  <LayoutList className="w-4 h-4" /> My Posts
                </Link>
              )}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-white/5 shadow-sm overflow-hidden">
              
              {/* === PROFILE TAB === */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <div className="px-6 py-5 border-b border-surface-100 dark:border-white/5">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Profile Information</h2>
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Update your account's profile information and email address.</p>
                  </div>
                  
                  {isFetchingProfile ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                      
                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Profile Photo
                        </label>
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-surface-100 dark:border-surface-800 shadow-sm">
                            {profileData.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 shadow-sm hover:bg-surface-50 dark:hover:bg-white/5 transition-colors">
                              {isUploadingAvatar ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                              ) : (
                                <><UploadCloud className="w-4 h-4" /> Change Photo</>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                className="sr-only"
                                onChange={handleAvatarUpload}
                                disabled={isUploadingAvatar}
                              />
                            </label>
                            <p className="mt-2 text-xs text-surface-500">JPG, GIF or PNG. Max size of 2MB.</p>
                          </div>
                        </div>
                      </div>

                      {/* Username & Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            required
                            value={profileData.username}
                            onChange={handleProfileChange}
                            className="block w-full rounded-xl border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 py-2.5 px-3.5 text-surface-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            disabled
                            value={profileData.email}
                            className="block w-full rounded-xl border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 py-2.5 px-3.5 text-surface-500 dark:text-surface-400 shadow-sm sm:text-sm cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Role & Package */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Account Role
                          </label>
                          <div className="block w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 py-2.5 px-3.5 text-surface-600 dark:text-surface-400 sm:text-sm">
                            {profileData.role}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Current Package
                          </label>
                          <div className="block w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 py-2.5 px-3.5 text-surface-600 dark:text-surface-400 sm:text-sm">
                            {profileData.packageId}
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      {profileMsg.text && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                          profileMsg.type === 'error' 
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                            : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                        }`}>
                          {profileMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          {profileMsg.text}
                        </div>
                      )}

                      <div className="pt-4 border-t border-surface-100 dark:border-white/5 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingProfile || isUploadingAvatar}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                        >
                          {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Changes
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              )}

              {/* === SECURITY TAB === */}
              {activeTab === 'security' && (
                <div className="animate-fade-in">
                  <div className="px-6 py-5 border-b border-surface-100 dark:border-white/5">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Change Password</h2>
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  
                  <form onSubmit={handleSavePassword} className="p-6 space-y-6">
                    <div className="space-y-5 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          value={passData.currentPassword}
                          onChange={handlePassChange}
                          className="block w-full rounded-xl border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 py-2.5 px-3.5 text-surface-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                        />
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          required
                          minLength={6}
                          value={passData.newPassword}
                          onChange={handlePassChange}
                          className="block w-full rounded-xl border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 py-2.5 px-3.5 text-surface-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={passData.confirmPassword}
                          onChange={handlePassChange}
                          className="block w-full rounded-xl border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 py-2.5 px-3.5 text-surface-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                        />
                      </div>
                    </div>

                    {passMsg.text && (
                      <div className={`p-3 rounded-lg text-sm flex items-center gap-2 max-w-md ${
                        passMsg.type === 'error' 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                      }`}>
                        {passMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {passMsg.text}
                      </div>
                    )}

                    <div className="pt-4 border-t border-surface-100 dark:border-white/5 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingPass}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                      >
                        {isSavingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* === PREFERENCES TAB === */}
              {activeTab === 'preferences' && (
                <div className="animate-fade-in">
                  <div className="px-6 py-5 border-b border-surface-100 dark:border-white/5">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white">App Preferences</h2>
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Customize how InvesTrack looks and feels.</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-surface-900 dark:text-white">Theme Mode</h3>
                          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Toggle between light and dark mode</p>
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, LogOut, User, Settings, Palette } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import NotificationsBell from '@/components/layout/NotificationsBell'

const navLinks = [
  { href: '/companies', label: 'Companies' },
  { href: '/investors', label: 'Investors' },
  { href: '/compare', label: 'Compare' },
  { href: '/raises', label: 'Raises' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const { user, isLoading: authLoading, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-white/5'
        : 'bg-white/60 dark:bg-surface-900/60 backdrop-blur-sm border-b border-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <span className="text-xl font-bold gradient-text">InvesTrack</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {!user && <ThemeToggle />}

            {authLoading ? (
              <div className="w-20 h-9 rounded-lg bg-slate-100 dark:bg-surface-800 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationsBell />
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-surface-700">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                      {user.username || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize leading-tight">
                      {user.role}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-surface-800 shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden animate-fade-in origin-top-right z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-white/5 lg:hidden">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user.username || user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Theme
                        </div>
                        <div className="scale-90 origin-right">
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-white/5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            ) : (
              /* Logged Out State */
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/60 dark:border-white/5">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                        {user.username || user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Link>
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme
                    </div>
                    <ThemeToggle />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 text-center rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2.5 text-sm font-medium text-white text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:opacity-90 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            {!user && (
              <div className="flex justify-center py-2 border-t border-slate-200/60 dark:border-white/5">
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

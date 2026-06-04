'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare Companies' },
  { href: '/companies', label: 'Companies' },
  { href: '/investors', label: 'Investors' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isLoading: authLoading, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60'
          : 'bg-white/60 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            {authLoading ? (
              <div className="w-20 h-9 rounded-lg bg-slate-100 animate-pulse"></div>
            ) : user ? (
              /* Logged In State */
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.username || user.email || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Log out</span>
                </button>
              </div>
            ) : (
              /* Logged Out State */
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all duration-200"
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
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/60">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200/60">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    {user.username || user.email || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 text-center rounded-lg hover:bg-slate-50 transition-all"
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
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

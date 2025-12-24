'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, Settings, User } from 'lucide-react'

export default function NavBar() {
  const path = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuth(!!token)
    if (token) {
      // Get user data if available
      const userData = localStorage.getItem('user')
      if (userData) setUser(JSON.parse(userData))
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuth(false)
    router.push('/landing')
  }

  const publicLinks = [
    { href: '/landing', label: 'Accueil' },
    { href: '/about', label: 'À propos' },
    { href: '/pricing', label: 'Tarifs' },
    { href: '/faq', label: 'FAQ' },
  ]

  const protectedLinks = [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/groupes', label: 'Groupes' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/settings', label: 'Paramètres' },
  ]

  const links = isAuth ? protectedLinks : publicLinks

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={isAuth ? '/dashboard' : '/landing'} className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/assets/img/logo-syfari.jpg" alt="SYFARI" className="w-10 h-10 rounded-full shadow" />
          <span className="font-bold text-orange-600 hidden sm:inline">SYFARI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                path === l.href
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuth && user ? (
            <>
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.prenom || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <Link
              href="/landing"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Connexion
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  path === l.href
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

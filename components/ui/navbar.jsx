"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const path = usePathname()

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/landing', label: 'Landing' },
    { href: '/groupes', label: 'Groupes' },
    { href: '/about', label: 'À propos' },
    { href: '/pricing', label: 'Tarifs' },
    { href: '/faq', label: 'FAQ' },
    { href: '/profile', label: 'Mon profil' },
  ]

  return (
    <nav className="bg-white/60 backdrop-blur sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img src="/assets/img/logo-syfari.jpg" alt="SYFARI" className="w-10 h-10 rounded-full" />
          </Link>
          <Link href="/" className="font-bold text-orange-600">SYFARI</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-md text-sm ${path === l.href ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="md:hidden">
          <button className="px-3 py-2 bg-orange-500 text-white rounded-md">Menu</button>
        </div>
      </div>
    </nav>
  )
}

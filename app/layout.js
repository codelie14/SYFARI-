import './globals.css'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const NavBar = dynamic(() => import('@/components/navbar'), { ssr: true })
const SonnerToaster = dynamic(() => import('sonner').then((mod) => mod.Toaster), { ssr: false })

const title = 'SYFARI — Gestion digitale des tontines'
const description = "SYFARI digitalise la gestion des tontines : cotisations, retraits, membres et transparence financière."

export const metadata = {
  title,
  description,
  keywords: ['tontine', 'gestion', 'épargne', 'cotisations', 'SYFARI', 'PayDunya'],
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL ? new URL(process.env.NEXT_PUBLIC_BASE_URL) : undefined,
  openGraph: {
    title,
    description,
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    siteName: 'SYFARI',
    images: ['/assets/img/logo-syfari.jpg'],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/assets/img/logo-syfari.jpg'],
  },
  icons: {
    icon: '/assets/img/logo-syfari.jpg',
    apple: '/assets/img/logo-syfari.jpg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#F97316" />
      </head>
      <body className="bg-gray-50">
        <NavBar />
        <main className="min-h-screen">{children}</main>
        <SonnerToaster richColors closeButton position="top-right" />
        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={'/assets/img/logo-syfari.jpg'}
                    alt="SYFARI"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-xl font-bold">SYFARI</span>
                </div>
                <p className="text-gray-400">
                  La plateforme de gestion de tontines la plus simple et sécurisée d'Afrique.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Produit</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/landing" className="hover:text-white">Accueil</Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white">Tarifs</Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-white">FAQ</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Entreprise</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/about" className="hover:text-white">À propos</Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white">Blog</Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white">Contact</Link>
                  </li>
                  <li>
                    <Link href="/cgv" className="hover:text-white">CGV</Link>
                  </li>
                  <li>
                    <Link href="/policy" className="hover:text-white">Confidentialité</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a className="hover:text-white" href="mailto:archangeyatte@gmail.com">archangeyatte@gmail.com</a>
                  </li>
                  <li>
                    <a className="hover:text-white" href="tel:+2250711454841">+225 07 11 45 48 41</a>
                  </li>
                  <li>Abidjan, Côte d'Ivoire</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 SYFARI - Tous droits réservés</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

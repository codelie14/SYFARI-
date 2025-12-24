import './globals.css'
import dynamic from 'next/dynamic'

const NavBar = dynamic(() => import('@/components/navbar'), { ssr: true })

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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
        <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-12">
          <p>© 2025 SYFARI — Tous droits réservés</p>
        </footer>
      </body>
    </html>
  )
}
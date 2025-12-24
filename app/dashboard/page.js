'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ groupes: 0, solde: 0, transactions: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    
    // Simuler chargement des données
    setTimeout(() => {
      setStats({ groupes: 3, solde: 125000, transactions: 24 })
      setLoading(false)
    }, 1000)
  }, [router])

  if (loading) return <Loader text="Chargement du tableau de bord..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Groupes actifs', value: stats.groupes, icon: '👥' },
          { label: 'Solde total', value: `${stats.solde.toLocaleString()} F`, icon: '💰' },
          { label: 'Transactions', value: stats.transactions, icon: '📊' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-gray-600 text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-orange-600">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions récentes</h2>
        <p className="text-gray-500">Aucune transaction pour le moment.</p>
      </div>
    </div>
  )
}

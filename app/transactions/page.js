'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function TransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) return <Loader text="Chargement des transactions..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold mb-8">Historique des transactions</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Groupe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                Aucune transaction pour le moment
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

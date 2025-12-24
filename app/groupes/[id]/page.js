'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function GroupeDetail({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { id } = params || {}

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) return <Loader text="Chargement du groupe..." />
  if (!id) return <div className="container mx-auto px-4 py-12 text-red-600">Groupe introuvable</div>

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold mb-8">Groupe {id}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4">Membres</h3>
          <p className="text-gray-500">0 membres</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4">Transactions récentes</h3>
          <p className="text-gray-500">Aucune transaction</p>
        </div>
      </div>
    </div>
  )
}

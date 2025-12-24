'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ prenom: '', nom: '', email: '', telephone: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  if (loading) return <Loader text="Chargement..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Paramètres</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            defaultValue={user.prenom}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            defaultValue={user.nom}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue={user.email}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            defaultValue={user.telephone}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <button className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium">
          Enregistrer les modifications
        </button>
      </div>
    </div>
  )
}

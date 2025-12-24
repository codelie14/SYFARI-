'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ prenom: '', nom: '', email: '' })

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

  if (loading) return <Loader text="Chargement du profil..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Mon profil</h1>

      <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition-shadow">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl">
          {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
        </div>
        <h2 className="text-2xl font-semibold mb-2">{user.prenom} {user.nom}</h2>
        <p className="text-gray-600 mb-6">{user.email}</p>

        <div className="space-y-3">
          <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Modifier le profil
          </button>
          <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Paramètres de sécurité
          </button>
        </div>
      </div>
    </div>
  )
}

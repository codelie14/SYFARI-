'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Loader from '@/components/loader'

export default function GroupesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) return <Loader text="Chargement des groupes..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Mes groupes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus className="w-5 h-5" />
          Créer un groupe
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 animate-in slide-in-from-top-2">
          <h2 className="text-xl font-semibold mb-4">Nouveau groupe</h2>
          <form className="space-y-4">
            <input placeholder="Nom du groupe" className="w-full p-2 border rounded" />
            <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3"></textarea>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
          <p className="text-lg">Aucun groupe pour le moment</p>
          <p className="text-sm">Créez votre premier groupe pour commencer</p>
        </div>
      </div>
    </div>
  )
}

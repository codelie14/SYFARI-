'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState({ prenom: '', nom: '', email: '', telephone: '', plan: null })
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '' })
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/landing')
        return
      }

      setPlan(localStorage.getItem('plan'))

      const localUser = localStorage.getItem('user')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          setUser((u) => ({ ...u, ...parsed }))
          setForm({
            prenom: parsed?.prenom || '',
            nom: parsed?.nom || '',
            email: parsed?.email || '',
            telephone: parsed?.telephone || '',
          })
        } catch {
        }
      }

      try {
        const res = await fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) {
          setUser(data)
          setForm({
            prenom: data?.prenom || '',
            nom: data?.nom || '',
            email: data?.email || '',
            telephone: data?.telephone || '',
          })
          localStorage.setItem('user', JSON.stringify(data))
          if (data?.plan) {
            localStorage.setItem('plan', data.plan)
            setPlan(data.plan)
          }
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [router])

  if (loading) return <Loader text="Chargement..." />

  const saveProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || 'Impossible de sauvegarder')
        return
      }
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Paramètres</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Forfait</div>
            <div className="text-lg font-semibold text-gray-900">{user.plan || plan || 'Non défini'}</div>
          </div>
          <Button variant="outline" onClick={() => router.push('/pricing?onboarding=1&next=%2Fdashboard')}>
            Changer de forfait
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            className="w-full p-3 border rounded-lg hover:border-orange-300 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={saveProfile} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  )
}

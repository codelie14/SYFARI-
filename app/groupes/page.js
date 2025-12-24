'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Users, Wallet, TrendingUp, Settings, Share2, Eye, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/loader'
import { toast } from 'sonner'

function GroupesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    cotisation: '',
    frequence: 'mensuelle',
  })
  const [groupes, setGroupes] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    if (searchParams.get('create') === '1') {
      setShowForm(true)
    }
    loadGroupes()
  }, [router, searchParams])

  const ensureActivePlan = async () => {
    const token = localStorage.getItem('token')
    if (!token) return false
    const headers = { Authorization: `Bearer ${token}` }
    const userRes = await fetch('/api/user', { headers })
    const userData = userRes.ok ? await userRes.json() : null
    if (!userData?.plan) {
      router.push('/pricing?onboarding=1&next=%2Fgroupes')
      return false
    }
    localStorage.setItem('plan', userData.plan)
    localStorage.setItem('user', JSON.stringify(userData))
    return true
  }

  const loadGroupes = async () => {
    try {
      setLoading(true)
      const ok = await ensureActivePlan()
      if (!ok) return
      const token = localStorage.getItem('token')
      const res = await fetch('/api/groupes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) {
        const payload = await res.json().catch(() => null)
        if (payload?.error === 'Aucun forfait actif') {
          router.push('/pricing?onboarding=1&next=%2Fgroupes')
          return
        }
      }
      const data = res.ok ? await res.json() : []
      setGroupes(Array.isArray(data) ? data : [])
    } catch (error) {
      setGroupes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const ok = await ensureActivePlan()
      if (!ok) return
      const token = localStorage.getItem('token')
      const res = await fetch('/api/groupes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: formData.nom,
          description: formData.description,
          montant_cotisation: Number(formData.cotisation),
          frequence_cotisation: formData.frequence,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data?.error === 'Aucun forfait actif') {
          router.push('/pricing?onboarding=1&next=%2Fgroupes')
          return
        }
        toast.error(data?.error || 'Erreur lors de la création')
        return
      }

      toast.success('Groupe créé avec succès')
      setFormData({ nom: '', description: '', cotisation: '', frequence: 'mensuelle' })
      setShowForm(false)
      loadGroupes()
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  if (loading) return <Loader text="Chargement des groupes..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Mes groupes</h1>
          <p className="text-gray-600">Gérez et suivez tous vos groupes d'épargne</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Créer un groupe
        </Button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <Card className="mb-8 bg-gradient-to-br from-orange-50 to-blue-50 border-orange-200 animate-in slide-in-from-top-2">
          <CardHeader>
            <CardTitle>Créer un nouveau groupe</CardTitle>
            <CardDescription>Remplissez les informations de base pour démarrer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom du groupe</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Tontine des Amis"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cotisation">Cotisation (F CFA)</Label>
                  <Input
                    id="cotisation"
                    type="number"
                    placeholder="50000"
                    value={formData.cotisation}
                    onChange={(e) => setFormData({...formData, cotisation: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="frequence">Fréquence</Label>
                <select
                  id="frequence"
                  value={formData.frequence}
                  onChange={(e) => setFormData({ ...formData, frequence: e.target.value })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="journaliere">Journalière</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuelle">Mensuelle</option>
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Description du groupe..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Créer le groupe
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Groupes actifs</CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600">{groupes.filter(g => g.statut === 'actif').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Solde total</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">{(groupes.reduce((sum, g) => sum + Number(g.solde || 0), 0) / 1000000).toFixed(1)}M F</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Membres totaux</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">{groupes.reduce((sum, g) => sum + Number(g.nb_membres || 0), 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {groupes.map((groupe) => (
          <Card key={groupe.id} className="hover:shadow-xl transition-all hover:border-orange-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-orange-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">👥</div>
                  <div>
                    <CardTitle>{groupe.nom}</CardTitle>
                    <Badge className={groupe.statut === 'actif' ? 'bg-green-100 text-green-800 mt-2' : 'bg-yellow-100 text-yellow-800 mt-2'}>
                      {groupe.statut === 'actif' ? 'Actif' : 'En attente'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm mb-4">{groupe.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Membres</p>
                  <p className="text-xl font-bold text-blue-600">{groupe.nb_membres || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Solde</p>
                  <p className="text-xl font-bold text-green-600">{Number(groupe.solde || 0).toLocaleString()} F</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Progression de cette semaine</p>
                  <p className="text-sm font-bold text-orange-600">
                    {Math.min(
                      100,
                      ((Number(groupe.solde || 0) / (Number(groupe.montant_cotisation || 0) * Math.max(1, groupe.nb_membres || 0))) || 0) * 100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(
                        100,
                        ((Number(groupe.solde || 0) / (Number(groupe.montant_cotisation || 0) * Math.max(1, groupe.nb_membres || 0))) || 0) * 100
                      )}%` 
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button onClick={() => router.push(`/groupes/${groupe.id}`)} className="flex-1 bg-orange-500 hover:bg-orange-600" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Détails
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groupes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">Aucun groupe pour le moment</p>
            <p className="text-gray-500 mb-6">Créez votre premier groupe pour commencer à épargner</p>
            <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Créer un groupe
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function GroupesPage() {
  return (
    <Suspense fallback={<Loader text="Chargement..." />}>
      <GroupesPageContent />
    </Suspense>
  )
}

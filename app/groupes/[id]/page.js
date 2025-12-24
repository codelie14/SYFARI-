'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Wallet, Send, Settings, ArrowLeft, Plus, Trash2, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Loader from '@/components/loader'

export default function GroupeDetail({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { id } = params || {}
  const [groupe, setGroupe] = useState(null)
  const [membres, setMembres] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    if (!id) return
    loadData()
  }, [router, id])

  const ensureActivePlan = async () => {
    const token = localStorage.getItem('token')
    if (!token) return false
    const headers = { Authorization: `Bearer ${token}` }
    const userRes = await fetch('/api/user', { headers })
    const userData = userRes.ok ? await userRes.json() : null
    if (!userData?.plan) {
      router.push(`/pricing?onboarding=1&next=${encodeURIComponent(`/groupes/${id}`)}`)
      return false
    }
    localStorage.setItem('plan', userData.plan)
    localStorage.setItem('user', JSON.stringify(userData))
    return true
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const ok = await ensureActivePlan()
      if (!ok) return
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const groupeRes = await fetch(`/api/groupes/${id}`, { headers })
      if (!groupeRes.ok) {
        if (groupeRes.status === 403) {
          const payload = await groupeRes.json().catch(() => null)
          if (payload?.error === 'Aucun forfait actif') {
            router.push(`/pricing?onboarding=1&next=${encodeURIComponent(`/groupes/${id}`)}`)
            return
          }
        }
        setGroupe(null)
        setMembres([])
        setTransactions([])
        return
      }
      const groupeData = await groupeRes.json()
      setGroupe(groupeData)
      setMembres(Array.isArray(groupeData?.membres) ? groupeData.membres : [])

      const txRes = await fetch(`/api/transactions?groupe_id=${id}`, { headers })
      const txData = txRes.ok ? await txRes.json() : []
      setTransactions(Array.isArray(txData) ? txData : [])
    } catch (error) {
      setGroupe(null)
      setMembres([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader text="Chargement du groupe..." />
  if (!id || !groupe) return <div className="container mx-auto px-4 py-12 text-red-600">Groupe introuvable</div>

  const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR')
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'cotisation': return '💵'
      case 'retrait': return '📤'
      case 'pénalité': return '⚠️'
      case 'remboursement': return '↩️'
      default: return '📊'
    }
  }

  const getStatusBadge = (statut) => {
    const ok = statut === 'valide' || statut === 'completed'
    return ok ? 'bg-green-100 text-green-800 text-xs' : 'bg-yellow-100 text-yellow-800 text-xs'
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg p-8 mb-8 border border-orange-200">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="text-6xl">👥</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{groupe.nom}</h1>
              <p className="text-gray-600 mb-4">{groupe.description}</p>
              <div className="flex gap-4">
                <Badge className={groupe.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {groupe.statut === 'actif' ? 'Actif' : 'En attente'}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">Créé le {formatDate(groupe.date_creation)}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-orange-500 hover:bg-orange-600" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Cotiser
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Membres</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{membres.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Solde total</CardDescription>
            <CardTitle className="text-3xl text-green-600">{Number(groupe.solde || 0).toLocaleString()} F</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cotisation</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{Number(groupe.montant_cotisation || 0).toLocaleString()} F</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Participation</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {Math.min(
                100,
                ((Number(groupe.solde || 0) / (Number(groupe.montant_cotisation || 0) * Math.max(1, membres.length))) || 0) * 100
              ).toFixed(0)}
              %
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du groupe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">{groupe.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-semibold">{groupe.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cotisation par membre</p>
                  <p className="font-semibold text-orange-600">{Number(groupe.montant_cotisation || 0).toLocaleString()} F CFA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <Badge className={groupe.statut === 'actif' ? 'bg-green-100 text-green-800 mt-1' : 'bg-yellow-100 text-yellow-800 mt-1'}>
                    {groupe.statut === 'actif' ? 'Actif' : 'En attente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm font-semibold">Taux de participation</span>
                  <span className="text-xl font-bold text-blue-600">
                    {Math.min(
                      100,
                      ((Number(groupe.solde || 0) / (Number(groupe.montant_cotisation || 0) * Math.max(1, membres.length))) || 0) * 100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-semibold">Moyenne par membre</span>
                  <span className="text-xl font-bold text-green-600">{(Number(groupe.solde || 0) / Math.max(1, membres.length)).toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-sm font-semibold">Cotisations attendues</span>
                  <span className="text-xl font-bold text-purple-600">{(Number(groupe.montant_cotisation || 0) * Math.max(1, membres.length)).toLocaleString()} F</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Membres du groupe ({membres.length})</CardTitle>
              <CardDescription>Liste de tous les membres et leurs contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {membres.map((membre) => (
                  <div key={membre.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {(membre.prenom || membre.nom || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{membre.prenom} {membre.nom}</p>
                        <p className="text-xs text-gray-500">{membre.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{formatDate(membre.date_adhesion)}</p>
                        <Badge className={membre.statut === 'actif' ? 'bg-green-100 text-green-800 text-xs' : 'bg-yellow-100 text-yellow-800 text-xs'}>
                          {membre.statut === 'actif' ? 'Actif' : 'En attente'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un membre
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
              <CardDescription>Historique de toutes les transactions du groupe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.membre_prenom} {tx.membre_nom}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.date_transaction)} - {tx.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{Number(tx.montant || 0).toLocaleString()} F</p>
                        <Badge className={getStatusBadge(tx.statut)}>
                          {tx.statut === 'completed' || tx.statut === 'valide' ? 'Validée' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du groupe</CardTitle>
              <CardDescription>Gérez les paramètres et permissions du groupe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Permettre aux membres d'ajouter de nouveaux membres</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Exiger une approbation pour les retraits</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Permettre le vote sur les décisions</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-red-600">Zone dangereuse</h3>
                <Button variant="destructive" size="sm">
                  Supprimer ce groupe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

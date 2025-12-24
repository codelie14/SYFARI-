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
  const [activeTab, setActiveTab] = useState('overview')
  const { id } = params || {}

  const groupeData = {
    nom: 'Tontine Familiale',
    description: 'Groupe d\'épargne familial regroupant les membres de la grande famille',
    image: '👨‍👩‍👧‍👦',
    membres: 12,
    solde: 500000,
    cotisation: 50000,
    dateCreation: '2024-01-01',
    status: 'active'
  }

  const membres = [
    { id: 1, nom: 'Jean Kouadio', role: 'Responsable', solde: 50000, statut: 'active' },
    { id: 2, nom: 'Aya Kouassi', role: 'Membre', solde: 45000, statut: 'active' },
    { id: 3, nom: 'Fatou Traoré', role: 'Trésorier', solde: 50000, statut: 'active' },
    { id: 4, nom: 'Marc Dubois', role: 'Membre', solde: 30000, statut: 'pending' },
    { id: 5, nom: 'Sophie Martin', role: 'Membre', solde: 50000, statut: 'active' },
  ]

  const transactions = [
    { id: 1, membre: 'Jean Kouadio', montant: 50000, type: 'cotisation', date: '2024-01-15', statut: 'completed' },
    { id: 2, membre: 'Aya Kouassi', montant: 50000, type: 'cotisation', date: '2024-01-15', statut: 'completed' },
    { id: 3, membre: 'Fatou Traoré', montant: 50000, type: 'cotisation', date: '2024-01-14', statut: 'completed' },
    { id: 4, membre: 'Marc Dubois', montant: 30000, type: 'retrait', date: '2024-01-13', statut: 'pending' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [router])

  if (loading) return <Loader text="Chargement du groupe..." />
  if (!id) return <div className="container mx-auto px-4 py-12 text-red-600">Groupe introuvable</div>

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
            <div className="text-6xl">{groupeData.image}</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{groupeData.nom}</h1>
              <p className="text-gray-600 mb-4">{groupeData.description}</p>
              <div className="flex gap-4">
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
                <Badge className="bg-blue-100 text-blue-800">Créé le {groupeData.dateCreation}</Badge>
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
            <CardTitle className="text-3xl text-blue-600">{groupeData.membres}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Solde total</CardDescription>
            <CardTitle className="text-3xl text-green-600">{groupeData.solde.toLocaleString()} F</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cotisation</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{groupeData.cotisation.toLocaleString()} F</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Participation</CardDescription>
            <CardTitle className="text-3xl text-purple-600">83%</CardTitle>
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
                  <p className="font-semibold">{groupeData.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-semibold">{groupeData.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cotisation par membre</p>
                  <p className="font-semibold text-orange-600">{groupeData.cotisation.toLocaleString()} F CFA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <Badge className="bg-green-100 text-green-800 mt-1">Actif</Badge>
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
                  <span className="text-xl font-bold text-blue-600">83%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-semibold">Moyenne par membre</span>
                  <span className="text-xl font-bold text-green-600">{(groupeData.solde / groupeData.membres).toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-sm font-semibold">Cotisations attendues</span>
                  <span className="text-xl font-bold text-purple-600">{(groupeData.cotisation * groupeData.membres).toLocaleString()} F</span>
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
                        {membre.nom[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{membre.nom}</p>
                        <p className="text-xs text-gray-500">{membre.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{membre.solde.toLocaleString()} F</p>
                        <Badge className={membre.statut === 'active' ? 'bg-green-100 text-green-800 text-xs' : 'bg-yellow-100 text-yellow-800 text-xs'}>
                          {membre.statut === 'active' ? 'Actif' : 'En attente'}
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
                        {tx.type === 'cotisation' ? '💵' : '↩️'}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.membre}</p>
                        <p className="text-xs text-gray-500">{tx.date} - {tx.type === 'cotisation' ? 'Cotisation' : 'Retrait'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{tx.montant.toLocaleString()} F</p>
                        <Badge className={tx.statut === 'completed' ? 'bg-green-100 text-green-800 text-xs' : 'bg-yellow-100 text-yellow-800 text-xs'}>
                          {tx.statut === 'completed' ? 'Complétée' : 'En attente'}
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

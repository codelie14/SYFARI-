'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, Users, Wallet, Send, Download, Eye, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    groupes: 0, 
    solde: 0, 
    transactions: 0,
    membres: 0
  })

  const recentTransactions = [
    { id: 1, groupe: 'Tontine Familiale', montant: 50000, type: 'cotisation', date: '2024-01-15', status: 'completed' },
    { id: 2, groupe: 'Association des Jeunes', montant: 100000, type: 'tirage', date: '2024-01-14', status: 'completed' },
    { id: 3, groupe: 'Tontine des Femmes', montant: 25000, type: 'pénalité', date: '2024-01-13', status: 'pending' },
    { id: 4, groupe: 'Tontine Familiale', montant: 50000, type: 'cotisation', date: '2024-01-12', status: 'completed' },
    { id: 5, groupe: 'Association des Jeunes', montant: 30000, type: 'remboursement', date: '2024-01-11', status: 'completed' },
  ]

  const groupes = [
    { id: 1, nom: 'Tontine Familiale', membres: 12, solde: 500000, cotisation: 50000, progress: 75 },
    { id: 2, nom: 'Association des Jeunes', membres: 25, solde: 800000, cotisation: 100000, progress: 60 },
    { id: 3, nom: 'Tontine des Femmes', membres: 8, solde: 300000, cotisation: 25000, progress: 90 },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    
    // Simuler chargement des données
    setTimeout(() => {
      setStats({ 
        groupes: 3, 
        solde: 1600000, 
        transactions: 24,
        membres: 45
      })
      setLoading(false)
    }, 1000)
  }, [router])

  if (loading) return <Loader text="Chargement du tableau de bord..." />

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'cotisation': return '💵'
      case 'tirage': return '🎯'
      case 'pénalité': return '⚠️'
      case 'remboursement': return '↩️'
      default: return '📊'
    }
  }

  const getStatusColor = (status) => {
    return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue ! Voici un aperçu de votre activité</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau groupe
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Groupes actifs', value: stats.groupes, icon: '👥', color: 'bg-blue-100', textColor: 'text-blue-600' },
          { label: 'Solde total', value: `${(stats.solde / 1000000).toFixed(1)}M F`, icon: '💰', color: 'bg-green-100', textColor: 'text-green-600' },
          { label: 'Transactions', value: stats.transactions, icon: '📊', color: 'bg-purple-100', textColor: 'text-purple-600' },
          { label: 'Membres', value: stats.membres, icon: '👤', color: 'bg-orange-100', textColor: 'text-orange-600' },
        ].map((card) => (
          <Card key={card.label} className="hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <CardDescription className="text-sm">{card.label}</CardDescription>
              <div className="flex justify-between items-center mt-2">
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                <div className={`${card.color} p-3 rounded-lg text-xl`}>{card.icon}</div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="md:col-span-2">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transactions récentes</CardTitle>
                  <CardDescription>Les 5 dernières transactions</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                      <div>
                        <p className="font-semibold text-sm">{tx.groupe}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{tx.montant.toLocaleString()} F</p>
                        <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                          {tx.status === 'completed' ? 'Complétée' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Voir toutes les transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="hover:shadow-lg transition-all mb-6">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Créer un groupe
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Envoyer une cotisation
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Inviter des membres
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Consultez notre documentation ou contactez notre support
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Contacter le support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Groups Overview */}
      <div className="mt-8">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Aperçu de vos groupes</CardTitle>
            <CardDescription>Évolution et participation de chaque groupe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupes.map((groupe) => (
                <div key={groupe.id} className="p-4 border rounded-lg hover:border-orange-200 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{groupe.nom}</h3>
                      <p className="text-sm text-gray-600">{groupe.membres} membres • Cotisation: {groupe.cotisation.toLocaleString()} F</p>
                    </div>
                    <p className="font-bold text-orange-600">{groupe.solde.toLocaleString()} F</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                      style={{ width: `${groupe.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{groupe.progress}% de progression</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

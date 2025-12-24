'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Loader from '@/components/loader'

export default function TransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const transactions = [
    { id: 1, date: '2024-01-15', groupe: 'Tontine Familiale', membre: 'Jean Kouadio', type: 'cotisation', montant: 50000, statut: 'completed', icon: '💵' },
    { id: 2, date: '2024-01-15', groupe: 'Association des Jeunes', membre: 'Aya Kouassi', type: 'cotisation', montant: 100000, statut: 'completed', icon: '💵' },
    { id: 3, date: '2024-01-14', groupe: 'Tontine Familiale', membre: 'Fatou Traoré', type: 'cotisation', montant: 50000, statut: 'completed', icon: '💵' },
    { id: 4, date: '2024-01-13', groupe: 'Tontine des Femmes', membre: 'Marc Dubois', type: 'retrait', montant: 300000, statut: 'pending', icon: '📤' },
    { id: 5, date: '2024-01-12', groupe: 'Association des Jeunes', membre: 'Sophie Martin', type: 'cotisation', montant: 100000, statut: 'completed', icon: '💵' },
    { id: 6, date: '2024-01-11', groupe: 'Tontine Familiale', membre: 'Pierre Dupont', type: 'pénalité', montant: 10000, statut: 'completed', icon: '⚠️' },
    { id: 7, date: '2024-01-10', groupe: 'Tontine des Femmes', membre: 'Agathe Martin', type: 'remboursement', montant: 50000, statut: 'completed', icon: '↩️' },
    { id: 8, date: '2024-01-09', groupe: 'Association des Jeunes', membre: 'Jean Paul', type: 'cotisation', montant: 100000, statut: 'completed', icon: '💵' },
  ]

  const stats = [
    { label: 'Total reçu', value: '650,000 F', icon: '💰', color: 'bg-green-100 text-green-600' },
    { label: 'Total retiré', value: '300,000 F', icon: '📤', color: 'bg-blue-100 text-blue-600' },
    { label: 'En attente', value: '2 transactions', icon: '⏳', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Pénalités', value: '10,000 F', icon: '⚠️', color: 'bg-red-100 text-red-600' },
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

  if (loading) return <Loader text="Chargement des transactions..." />

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = search === '' || 
      tx.groupe.toLowerCase().includes(search.toLowerCase()) ||
      tx.membre.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || tx.type === filter || tx.statut === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (statut) => {
    return statut === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Historique des transactions</h1>
          <p className="text-gray-600">Consultez toutes les transactions de vos groupes</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardDescription className="text-xs">{stat.label}</CardDescription>
              <div className="flex justify-between items-center mt-2">
                <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
                <div className={`${stat.color} p-3 rounded-lg text-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Groupe, membre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Toutes les transactions</option>
                <option value="cotisation">Cotisations</option>
                <option value="retrait">Retraits</option>
                <option value="pénalité">Pénalités</option>
                <option value="remboursement">Remboursements</option>
                <option value="completed">Complétées</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} résultat{filteredTransactions.length !== 1 ? 's' : ''} trouvé{filteredTransactions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Groupe</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Membre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm">{tx.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{tx.groupe}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.membre}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tx.icon}</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">{tx.montant.toLocaleString()} F</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(tx.statut)}>
                          {tx.statut === 'completed' ? 'Complétée' : 'En attente'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

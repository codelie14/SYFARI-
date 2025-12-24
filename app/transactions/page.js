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
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    loadTransactions()
  }, [router])

  const ensureActivePlan = async () => {
    const token = localStorage.getItem('token')
    if (!token) return false
    const headers = { Authorization: `Bearer ${token}` }
    const userRes = await fetch('/api/user', { headers })
    const userData = userRes.ok ? await userRes.json() : null
    if (!userData?.plan) {
      router.push('/pricing?onboarding=1&next=%2Ftransactions')
      return false
    }
    localStorage.setItem('plan', userData.plan)
    localStorage.setItem('user', JSON.stringify(userData))
    return true
  }

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const ok = await ensureActivePlan()
      if (!ok) return
      const token = localStorage.getItem('token')
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) {
        const payload = await res.json().catch(() => null)
        if (payload?.error === 'Aucun forfait actif') {
          router.push('/pricing?onboarding=1&next=%2Ftransactions')
          return
        }
      }
      const data = res.ok ? await res.json() : []
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader text="Chargement des transactions..." />

  const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR')
  }

  const getIcon = (type) => {
    switch (type) {
      case 'cotisation': return '💵'
      case 'retrait': return '📤'
      case 'pénalité': return '⚠️'
      case 'remboursement': return '↩️'
      default: return '📊'
    }
  }

  const normalizedTransactions = transactions.map((tx) => {
    const statut = tx.statut === 'valide' || tx.statut === 'completed' ? 'completed' : 'pending'
    return {
      id: tx.id,
      date: formatDate(tx.date_transaction),
      groupe: tx.groupe_nom || '—',
      membre: `${tx.membre_prenom || ''} ${tx.membre_nom || ''}`.trim() || '—',
      type: tx.type || '—',
      montant: Number(tx.montant || 0),
      statut,
      icon: getIcon(tx.type),
    }
  })

  const totalRecu = normalizedTransactions
    .filter((t) => t.type === 'cotisation')
    .reduce((sum, t) => sum + t.montant, 0)
  const totalRetire = normalizedTransactions
    .filter((t) => t.type === 'retrait')
    .reduce((sum, t) => sum + t.montant, 0)
  const enAttente = normalizedTransactions.filter((t) => t.statut !== 'completed').length
  const totalPenalites = normalizedTransactions
    .filter((t) => t.type === 'pénalité')
    .reduce((sum, t) => sum + t.montant, 0)

  const stats = [
    { label: 'Total reçu', value: `${totalRecu.toLocaleString()} F`, icon: '💰', color: 'bg-green-100 text-green-600' },
    { label: 'Total retiré', value: `${totalRetire.toLocaleString()} F`, icon: '📤', color: 'bg-blue-100 text-blue-600' },
    { label: 'En attente', value: `${enAttente} transaction${enAttente !== 1 ? 's' : ''}`, icon: '⏳', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Pénalités', value: `${totalPenalites.toLocaleString()} F`, icon: '⚠️', color: 'bg-red-100 text-red-600' },
  ]

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = search === '' || 
      (tx.groupe_nom || '').toLowerCase().includes(search.toLowerCase()) ||
      (`${tx.membre_prenom || ''} ${tx.membre_nom || ''}`).toLowerCase().includes(search.toLowerCase())
    const normalizedStatus = tx.statut === 'valide' || tx.statut === 'completed' ? 'completed' : 'pending'
    const matchesFilter = filter === 'all' || tx.type === filter || normalizedStatus === filter
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
                      <td className="px-6 py-4 text-sm">{formatDate(tx.date_transaction)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{tx.groupe_nom || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{`${tx.membre_prenom || ''} ${tx.membre_nom || ''}`.trim() || '—'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getIcon(tx.type)}</span>
                          <span className="capitalize">{tx.type || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">{Number(tx.montant || 0).toLocaleString()} F</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(tx.statut === 'valide' || tx.statut === 'completed' ? 'completed' : 'pending')}>
                          {tx.statut === 'valide' || tx.statut === 'completed' ? 'Validée' : 'En attente'}
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

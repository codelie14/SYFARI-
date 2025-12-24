'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, Users, Wallet, Send, Download, Eye, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [stats, setStats] = useState({ 
    groupes: 0, 
    solde: 0, 
    transactions: 0,
    membres: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [groupes, setGroupes] = useState([])
  const [allGroupes, setAllGroupes] = useState([])
  const [allTransactions, setAllTransactions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const userRes = await fetch('/api/user', { headers })
      const userData = userRes.ok ? await userRes.json() : null
      if (!userData?.plan) {
        router.push('/pricing?onboarding=1&next=%2Fdashboard')
        return
      }
      localStorage.setItem('plan', userData.plan)
      localStorage.setItem('user', JSON.stringify(userData))
      setPlan(userData.plan)

      // Charger les groupes
      const groupesRes = await fetch('/api/groupes', { headers })
      const groupesData = groupesRes.ok ? await groupesRes.json() : []
      setAllGroupes(Array.isArray(groupesData) ? groupesData : [])
      setGroupes(groupesData.slice(0, 3))

      // Charger les transactions
      const transRes = await fetch('/api/transactions', { headers })
      const transData = transRes.ok ? await transRes.json() : []
      setAllTransactions(Array.isArray(transData) ? transData : [])
      setRecentTransactions(transData.slice(0, 5))

      // Calculer les stats
      const totalSolde = groupesData.reduce((sum, g) => sum + Number(g.solde || 0), 0)
      const totalMembres = groupesData.reduce((sum, g) => sum + (g.nb_membres || 0), 0)

      setStats({
        groupes: groupesData.length,
        solde: totalSolde,
        transactions: transData.length,
        membres: totalMembres
      })
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

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
    return status === 'completed' || status === 'valide' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))

  const openDashboardReport = () => {
    if (!plan || (plan !== 'standard' && plan !== 'premium')) {
      router.push('/pricing?onboarding=1&next=%2Fdashboard')
      return
    }

    const title = 'Rapport — Tableau de bord'
    const now = new Date().toLocaleString('fr-FR')
    const groupsRows = allGroupes.map((g) => `
      <tr>
        <td>${escapeHtml(g.nom || '—')}</td>
        <td style="text-align:right">${escapeHtml(Number(g.nb_membres || 0).toLocaleString('fr-FR'))}</td>
        <td style="text-align:right">${escapeHtml(Number(g.solde || 0).toLocaleString('fr-FR'))} F</td>
        <td>${escapeHtml(g.frequence_cotisation || '—')}</td>
      </tr>
    `).join('')

    const txRows = allTransactions.slice(0, 100).map((t) => `
      <tr>
        <td>${escapeHtml(t.date_transaction ? new Date(t.date_transaction).toLocaleDateString('fr-FR') : '—')}</td>
        <td>${escapeHtml(t.groupe_nom || '—')}</td>
        <td>${escapeHtml(`${t.membre_prenom || ''} ${t.membre_nom || ''}`.trim() || '—')}</td>
        <td>${escapeHtml(t.type || '—')}</td>
        <td style="text-align:right">${escapeHtml(Number(t.montant || 0).toLocaleString('fr-FR'))} F</td>
        <td>${escapeHtml(t.statut === 'completed' || t.statut === 'valide' ? 'Validée' : 'En attente')}</td>
      </tr>
    `).join('')

    const html = `<!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;color:#111}
          h1{font-size:18px;margin:0 0 6px}
          h2{font-size:14px;margin:18px 0 8px}
          .meta{color:#555;font-size:12px;margin-bottom:16px}
          .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
          .kpi{border:1px solid #ddd;border-radius:10px;padding:10px}
          .kpi .label{color:#555;font-size:11px}
          .kpi .value{font-size:16px;font-weight:700;margin-top:4px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
          th{background:#f5f5f5;text-align:left}
          @media print{body{padding:0} .no-print{display:none} .grid{grid-template-columns:repeat(2,1fr)}}
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:12px">
          <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
        </div>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Généré le ${escapeHtml(now)}</div>
        <div class="grid">
          <div class="kpi"><div class="label">Groupes</div><div class="value">${escapeHtml(stats.groupes)}</div></div>
          <div class="kpi"><div class="label">Solde total</div><div class="value">${escapeHtml(Number(stats.solde || 0).toLocaleString('fr-FR'))} F</div></div>
          <div class="kpi"><div class="label">Transactions</div><div class="value">${escapeHtml(stats.transactions)}</div></div>
          <div class="kpi"><div class="label">Membres</div><div class="value">${escapeHtml(stats.membres)}</div></div>
        </div>
        <h2>Groupes (${escapeHtml(String(allGroupes.length))})</h2>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th style="text-align:right">Membres</th>
              <th style="text-align:right">Solde</th>
              <th>Fréquence</th>
            </tr>
          </thead>
          <tbody>${groupsRows}</tbody>
        </table>
        <h2>Transactions (100 dernières)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Groupe</th>
              <th>Membre</th>
              <th>Type</th>
              <th style="text-align:right">Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>${txRows}</tbody>
        </table>
      </body>
      </html>`

    const w = window.open('', '_blank', 'noopener,noreferrer')
    if (!w) {
      toast.error('Popup bloquée par le navigateur')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue ! Voici un aperçu de votre activité</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600" size="sm" onClick={() => router.push('/groupes?create=1')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau groupe
          </Button>
          <Button variant="outline" size="sm" onClick={openDashboardReport}>
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
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                        <div>
                          <p className="font-semibold text-sm">{tx.groupe_nom || 'Groupe'}</p>
                          <p className="text-xs text-gray-500">
                            {tx.date_transaction ? new Date(tx.date_transaction).toLocaleDateString('fr-FR') : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{(tx.montant || 0).toLocaleString()} F</p>
                          <Badge className={`text-xs ${getStatusColor(tx.statut)}`}>
                            {tx.statut === 'completed' || tx.statut === 'valide' ? 'Validée' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">Aucune transaction</div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/transactions')}>
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
              <Button className="w-full bg-orange-500 hover:bg-orange-600 justify-start" size="sm" onClick={() => router.push('/groupes?create=1')}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un groupe
              </Button>
              <Button className="w-full" variant="outline" size="sm" onClick={() => router.push('/transactions')}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer une cotisation
              </Button>
              <Button className="w-full" variant="outline" size="sm" onClick={() => router.push('/groupes')}>
                <Users className="w-4 h-4 mr-2" />
                Inviter des membres
              </Button>
              <Button className="w-full" variant="outline" size="sm" onClick={() => router.push('/settings')}>
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
              {groupes.length > 0 ? (
                groupes.map((groupe) => (
                  <div key={groupe.id} className="p-4 border rounded-lg hover:border-orange-200 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{groupe.nom}</h3>
                        <p className="text-sm text-gray-600">{groupe.nb_membres || 0} membres • Cotisation: {(groupe.montant_cotisation || 0).toLocaleString()} F</p>
                      </div>
                      <p className="font-bold text-orange-600">{Number(groupe.solde || 0).toLocaleString()} F</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((Number(groupe.solde || 0) / (Number(groupe.montant_cotisation || 0) * Math.max(1, groupe.nb_membres || 0))) || 0) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">Aucun groupe</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

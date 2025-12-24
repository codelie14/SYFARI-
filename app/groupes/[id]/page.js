'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, ArrowLeft, Plus, Trash2, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Loader from '@/components/loader'
import { toast } from 'sonner'

export default function GroupeDetail({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { id } = params || {}
  const [user, setUser] = useState(null)
  const [plan, setPlan] = useState(null)
  const [groupe, setGroupe] = useState(null)
  const [membres, setMembres] = useState([])
  const [transactions, setTransactions] = useState([])
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberSubmitting, setMemberSubmitting] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txSubmitting, setTxSubmitting] = useState(false)
  const [txForm, setTxForm] = useState({ type: 'cotisation', membre_id: '', montant: '', description: '' })

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
    setUser(userData)
    setPlan(userData.plan)
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

  const isResponsable = String(groupe.responsable_id || '') === String(user?.id || '')

  const requireStandardExport = () => {
    if (plan === 'standard' || plan === 'premium') return true
    router.push(`/pricing?onboarding=1&next=${encodeURIComponent(`/groupes/${id}`)}`)
    return false
  }

  const escapeCsv = (value) => {
    const s = String(value ?? '')
    const escaped = s.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const downloadCsv = (filename, header, rows) => {
    const lines = [
      header.map(escapeCsv).join(';'),
      ...rows.map((r) => r.map(escapeCsv).join(';')),
    ]
    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportMembersCsv = () => {
    if (!requireStandardExport()) return
    downloadCsv(
      `membres_${groupe.nom}_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date adhésion', 'Statut'],
      membres.map((m) => [
        m.prenom || '',
        m.nom || '',
        m.email || '',
        m.telephone || '',
        formatDate(m.date_adhesion),
        m.statut || '',
      ])
    )
  }

  const exportTransactionsCsv = () => {
    if (!requireStandardExport()) return
    downloadCsv(
      `transactions_${groupe.nom}_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Membre', 'Type', 'Montant', 'Statut', 'Description'],
      transactions.map((t) => [
        formatDate(t.date_transaction),
        `${t.membre_prenom || ''} ${t.membre_nom || ''}`.trim(),
        t.type || '',
        Number(t.montant || 0),
        t.statut || '',
        t.description || '',
      ])
    )
  }

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const openGroupReportPdf = () => {
    if (!requireStandardExport()) return

    const title = `Rapport — ${groupe.nom}`
    const now = new Date().toLocaleString('fr-FR')
    const membersRows = membres
      .map(
        (m) => `
        <tr>
          <td>${escapeHtml(m.prenom || '')}</td>
          <td>${escapeHtml(m.nom || '')}</td>
          <td>${escapeHtml(m.email || '')}</td>
          <td>${escapeHtml(m.telephone || '')}</td>
          <td>${escapeHtml(formatDate(m.date_adhesion))}</td>
          <td>${escapeHtml(m.statut || '')}</td>
        </tr>`
      )
      .join('')

    const txRows = transactions
      .slice(0, 200)
      .map(
        (t) => `
        <tr>
          <td>${escapeHtml(formatDate(t.date_transaction))}</td>
          <td>${escapeHtml(`${t.membre_prenom || ''} ${t.membre_nom || ''}`.trim())}</td>
          <td>${escapeHtml(t.type || '')}</td>
          <td style="text-align:right">${escapeHtml(Number(t.montant || 0).toLocaleString())} F</td>
          <td>${escapeHtml(t.statut || '')}</td>
          <td>${escapeHtml(t.description || '')}</td>
        </tr>`
      )
      .join('')

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          body{font-family:Arial, sans-serif;padding:24px;color:#111}
          h1{margin:0 0 8px 0}
          .meta{color:#555;margin-bottom:18px}
          .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0 18px}
          .card{border:1px solid #eee;border-radius:10px;padding:12px}
          .label{font-size:12px;color:#666}
          .value{font-size:18px;font-weight:700}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
          th{background:#f5f5f5;text-align:left}
          @media print{body{padding:0} .no-print{display:none}}
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:12px">
          <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
        </div>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Généré le ${escapeHtml(now)} • ${escapeHtml(String(membres.length))} membres • ${escapeHtml(String(transactions.length))} transactions</div>
        <div class="grid">
          <div class="card"><div class="label">Solde</div><div class="value">${escapeHtml(Number(groupe.solde || 0).toLocaleString())} F</div></div>
          <div class="card"><div class="label">Cotisation</div><div class="value">${escapeHtml(Number(groupe.montant_cotisation || 0).toLocaleString())} F</div></div>
          <div class="card"><div class="label">Fréquence</div><div class="value">${escapeHtml(groupe.frequence_cotisation || '—')}</div></div>
        </div>
        <h2>Membres</h2>
        <table>
          <thead><tr><th>Prénom</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Adhésion</th><th>Statut</th></tr></thead>
          <tbody>${membersRows || '<tr><td colspan="6">Aucun membre</td></tr>'}</tbody>
        </table>
        <h2 style="margin-top:18px">Transactions (200 dernières)</h2>
        <table>
          <thead><tr><th>Date</th><th>Membre</th><th>Type</th><th style="text-align:right">Montant</th><th>Statut</th><th>Description</th></tr></thead>
          <tbody>${txRows || '<tr><td colspan="6">Aucune transaction</td></tr>'}</tbody>
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

  const openAddMember = () => {
    if (!isResponsable) {
      toast.error('Seul le responsable peut ajouter des membres')
      return
    }
    setMemberEmail('')
    setAddMemberOpen(true)
  }

  const submitAddMember = async () => {
    const email = memberEmail.trim()
    if (!email) return
    setMemberSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/groupes/${id}/membres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || 'Impossible d’ajouter le membre')
        return
      }
      toast.success('Membre ajouté')
      setAddMemberOpen(false)
      await loadData()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setMemberSubmitting(false)
    }
  }

  const removeMember = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/groupes/${id}/membres/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || 'Impossible de retirer le membre')
        return
      }
      toast.success('Membre retiré')
      await loadData()
    } catch {
      toast.error('Erreur de connexion')
    }
  }

  const openTxDialog = (preset = {}) => {
    const nextForm = {
      type: preset.type || (isResponsable ? 'cotisation' : 'cotisation'),
      membre_id: preset.membre_id || '',
      montant: preset.montant || String(Number(groupe.montant_cotisation || 0) || ''),
      description: preset.description || '',
    }
    setTxForm(nextForm)
    setTxOpen(true)
  }

  const submitTransaction = async () => {
    const montantNumber = Number(txForm.montant)
    if (!Number.isFinite(montantNumber) || montantNumber <= 0) {
      toast.error('Montant invalide')
      return
    }

    if (!isResponsable && txForm.type !== 'cotisation') {
      toast.error('Action non autorisée')
      return
    }

    setTxSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const payload = {
        groupe_id: id,
        montant: montantNumber,
        type: txForm.type,
        description: txForm.description || null,
      }
      if (isResponsable && txForm.type === 'cotisation' && txForm.membre_id) {
        payload.membre_id = txForm.membre_id
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || 'Impossible de créer la transaction')
        return
      }
      toast.success('Transaction enregistrée')
      setTxOpen(false)
      await loadData()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setTxSubmitting(false)
    }
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
            <Button className="bg-orange-500 hover:bg-orange-600" size="sm" onClick={() => openTxDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Cotiser
            </Button>
            <Button variant="outline" size="sm" onClick={openGroupReportPdf}>
              <FileText className="w-4 h-4 mr-2" />
              Rapport PDF
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Membres du groupe ({membres.length})</CardTitle>
                  <CardDescription>Liste de tous les membres et leurs contributions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportMembersCsv}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={openAddMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
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
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openTxDialog({ type: 'cotisation', membre_id: membre.id, montant: String(Number(groupe.montant_cotisation || 0) || '') })}>
                          Cotisation
                        </Button>
                        {isResponsable && String(membre.id) !== String(groupe.responsable_id || '') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Le membre n’aura plus accès au groupe. Cette action est réversible en le réajoutant.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeMember(membre.id)}>Retirer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Historique de toutes les transactions du groupe</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportTransactionsCsv}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => openTxDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
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
                {isResponsable ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Supprimer ce groupe
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprime le groupe et ses données associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token')
                              const res = await fetch(`/api/groupes/${id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                              })
                              const data = await res.json().catch(() => null)
                              if (!res.ok) {
                                toast.error(data?.error || 'Impossible de supprimer le groupe')
                                return
                              }
                              toast.success('Groupe supprimé')
                              router.push('/groupes')
                            } catch {
                              toast.error('Erreur de connexion')
                            }
                          }}
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div className="text-sm text-gray-600">Seul le responsable peut supprimer le groupe.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un membre</DialogTitle>
            <DialogDescription>Ajoutez un membre existant via son email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="membre@example.com"
                type="email"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={submitAddMember} disabled={memberSubmitting || !memberEmail.trim()}>
              {memberSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle transaction</DialogTitle>
            <DialogDescription>Enregistrez une cotisation (ou un retrait si responsable).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isResponsable && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={txForm.type} onValueChange={(v) => setTxForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotisation">Cotisation</SelectItem>
                    <SelectItem value="retrait">Retrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isResponsable && txForm.type === 'cotisation' && (
              <div className="space-y-2">
                <Label>Membre</Label>
                <Select value={txForm.membre_id || 'self'} onValueChange={(v) => setTxForm((f) => ({ ...f, membre_id: v === 'self' ? '' : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Moi</SelectItem>
                    {membres.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {`${m.prenom || ''} ${m.nom || ''}`.trim() || m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Montant (F CFA)</Label>
              <Input
                value={txForm.montant}
                onChange={(e) => setTxForm((f) => ({ ...f, montant: e.target.value }))}
                type="number"
                min="0"
                placeholder={String(Number(groupe.montant_cotisation || 0) || '')}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Textarea
                value={txForm.description}
                onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Cotisation de décembre"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setTxOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={submitTransaction} disabled={txSubmitting}>
              {txSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

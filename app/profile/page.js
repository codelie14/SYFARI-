'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X, Lock, Bell, Eye, LogOut, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Loader from '@/components/loader'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({ 
    prenom: 'Jean', 
    nom: 'Kouadio', 
    email: 'jean@example.com',
    telephone: '+225 07 11 45 48 41',
    createdAt: '2024-01-01'
  })
  const [editData, setEditData] = useState(user)

  const stats = [
    { label: 'Groupes', value: 3, icon: '👥' },
    { label: 'Solde total', value: '1.6M F', icon: '💰' },
    { label: 'Transactions', value: 24, icon: '📊' },
    { label: 'Cotisations payées', value: 100, icon: '✅' },
  ]

  const preferences = [
    { id: 1, label: 'Notifications SMS', description: 'Recevoir des SMS pour les rappels', enabled: true },
    { id: 2, label: 'Notifications Email', description: 'Recevoir des emails pour les mises à jour', enabled: true },
    { id: 3, label: 'Rapports hebdomadaires', description: 'Recevoir un rapport chaque lundi', enabled: false },
    { id: 4, label: 'Alertes transactions', description: 'Alertes pour chaque transaction', enabled: true },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/landing')
      return
    }
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setEditData(parsed)
    }
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [router])

  const handleSave = () => {
    setUser(editData)
    localStorage.setItem('user', JSON.stringify(editData))
    setIsEditing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/landing')
  }

  if (loading) return <Loader text="Chargement du profil..." />

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Mon profil</h1>
        <Button variant="destructive" onClick={handleLogout} size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8 bg-gradient-to-br from-orange-50 to-blue-50 border-orange-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {editData.prenom?.charAt(0)}{editData.nom?.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{editData.prenom} {editData.nom}</h2>
                <p className="text-gray-600">{editData.email}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Profil actif</Badge>
              </div>
            </div>
            <Button 
              variant={isEditing ? 'outline' : 'default'}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form or Stats */}
      {isEditing ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifier les informations</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={editData.prenom}
                    onChange={(e) => setEditData({...editData, prenom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={editData.nom}
                    onChange={(e) => setEditData({...editData, nom: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={editData.telephone}
                  onChange={(e) => setEditData({...editData, telephone: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardDescription className="text-xs">{stat.label}</CardDescription>
                <div className="flex justify-between items-center mt-2">
                  <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Info Grid */}
      {!isEditing && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Prénom</p>
                <p className="font-semibold">{user.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-semibold">{user.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-semibold">{user.telephone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inscrit depuis</p>
                <p className="font-semibold">{user.createdAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Changer le mot de passe</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Voir les connexions actives</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  ✅ Votre compte est sécurisé. Authentification à deux facteurs recommandée.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences de notifications</CardTitle>
          <CardDescription>Contrôlez comment vous recevez les notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold">{pref.label}</p>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={pref.enabled}
                  className="w-5 h-5 accent-orange-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-3">Zone dangereuse</h3>
        <p className="text-sm text-red-800 mb-4">
          Ces actions ne peuvent pas être annulées. Soyez prudent.
        </p>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm">
            Supprimer le compte
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Déconnexion complète
          </Button>
        </div>
      </div>
    </div>
  )
}

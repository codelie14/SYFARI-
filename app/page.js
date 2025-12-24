"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Wallet, Plus, Home, LogOut, ArrowUpRight, ArrowDownRight, Vote } from 'lucide-react';
import { toast } from 'sonner';

export default function App() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [votes, setVotes] = useState([]);

  // Nouveau groupe state
  const [newGroupe, setNewGroupe] = useState({
    nom: '',
    description: '',
    montant_cotisation: '',
    frequence_cotisation: 'mensuelle'
  });

  // Nouvelle transaction state
  const [newTransaction, setNewTransaction] = useState({
    groupe_id: '',
    montant: '',
    type: 'cotisation',
    description: ''
  });

  // Nouveau membre state
  const [newMembreEmail, setNewMembreEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          loadDashboard();
          loadGroupes();
        } else {
          localStorage.removeItem('token');
          router.push('/landing');
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        router.push('/landing');
      }
    } else {
      router.push('/landing');
    }
    setLoading(false);
  };

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    }
  };

  const loadGroupes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/groupes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroupes(data);
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    }
  };

  const loadGroupeDetails = async (groupeId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/groupes/${groupeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedGroupe(data);
        setCurrentView('groupe-detail');
        loadTransactions(groupeId);
        loadVotes(groupeId);
      }
    } catch (error) {
      console.error('Erreur chargement groupe:', error);
    }
  };

  const loadTransactions = async (groupeId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions?groupe_id=${groupeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    }
  };

  const loadVotes = async (groupeId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/votes?groupe_id=${groupeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVotes(data);
      }
    } catch (error) {
      console.error('Erreur chargement votes:', error);
    }
  };

  const createGroupe = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/groupes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroupe)
      });

      if (res.ok) {
        toast.success('Groupe créé avec succès !');
        setNewGroupe({ nom: '', description: '', montant_cotisation: '', frequence_cotisation: 'mensuelle' });
        loadGroupes();
        loadDashboard();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur de création');
    }
  };

  const createTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction)
      });

      if (res.ok) {
        toast.success('Transaction enregistrée !');
        setNewTransaction({ groupe_id: '', montant: '', type: 'cotisation', description: '' });
        loadTransactions(selectedGroupe.id);
        loadGroupeDetails(selectedGroupe.id);
        loadDashboard();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const addMembre = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/groupes/${selectedGroupe.id}/membres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newMembreEmail })
      });

      if (res.ok) {
        toast.success('Membre ajouté !');
        setNewMembreEmail('');
        loadGroupeDetails(selectedGroupe.id);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/landing');
    toast.success('Déconnexion réussie');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={'/assets/img/logo-syfari.jpg'}
              alt="SYFARI"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <h1 className="text-2xl font-bold">SYFARI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Bienvenue, {user?.prenom} {user?.nom}</span>
            <Button variant="outline" size="sm" onClick={logout} className="bg-white text-orange-600 hover:bg-orange-50">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
            className={currentView === 'dashboard' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Home className="w-4 h-4 mr-2" />
            Tableau de bord
          </Button>
          <Button
            variant={currentView === 'groupes' ? 'default' : 'outline'}
            onClick={() => setCurrentView('groupes')}
            className={currentView === 'groupes' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Mes groupes
          </Button>
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mes groupes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.nb_groupes}</div>
                  <p className="text-xs text-muted-foreground">Groupes actifs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Solde total</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.solde_total.toLocaleString()} F CFA</div>
                  <p className="text-xs text-muted-foreground">Dans mes groupes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cotisations en attente</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.cotisations_en_attente}</div>
                  <p className="text-xs text-muted-foreground">À payer</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transactions récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.transactions_recentes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune transaction pour le moment</p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.transactions_recentes.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'cotisation' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'cotisation' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.groupe_nom}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.membre_nom} {transaction.membre_prenom} - {transaction.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'cotisation' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'cotisation' ? '+' : '-'}
                            {parseFloat(transaction.montant).toLocaleString()} F
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Groupes View */}
        {currentView === 'groupes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Mes groupes</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un groupe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                      Créez un groupe de tontine pour commencer à gérer vos cotisations
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createGroupe} className="space-y-4">
                    <div>
                      <Label htmlFor="nom">Nom du groupe</Label>
                      <Input
                        id="nom"
                        placeholder="Ex: Tontine des amis"
                        value={newGroupe.nom}
                        onChange={(e) => setNewGroupe({ ...newGroupe, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description du groupe..."
                        value={newGroupe.description}
                        onChange={(e) => setNewGroupe({ ...newGroupe, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="montant">Montant de cotisation (F CFA)</Label>
                      <Input
                        id="montant"
                        type="number"
                        placeholder="5000"
                        value={newGroupe.montant_cotisation}
                        onChange={(e) => setNewGroupe({ ...newGroupe, montant_cotisation: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequence">Fréquence de cotisation</Label>
                      <Select
                        value={newGroupe.frequence_cotisation}
                        onValueChange={(value) => setNewGroupe({ ...newGroupe, frequence_cotisation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                          <SelectItem value="mensuelle">Mensuelle</SelectItem>
                          <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                      Créer le groupe
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {groupes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore de groupe</p>
                  <p className="text-sm text-muted-foreground">Créez votre premier groupe pour commencer</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupes.map((groupe) => (
                  <Card key={groupe.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => loadGroupeDetails(groupe.id)}>
                    <CardHeader>
                      <CardTitle>{groupe.nom}</CardTitle>
                      <CardDescription>{groupe.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Solde:</span>
                          <span className="font-semibold">{parseFloat(groupe.solde).toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Cotisation:</span>
                          <span className="font-semibold">{parseFloat(groupe.montant_cotisation).toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Fréquence:</span>
                          <Badge variant="outline">{groupe.frequence_cotisation}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Membres:</span>
                          <span className="font-semibold">{groupe.nb_membres}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Groupe Detail View - Same as before but shortened for brevity */}
        {currentView === 'groupe-detail' && selectedGroupe && (
          <div>
            <Button variant="outline" onClick={() => { setCurrentView('groupes'); setSelectedGroupe(null); }} className="mb-6">
              ← Retour aux groupes
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedGroupe.nom}</CardTitle>
                    <CardDescription>{selectedGroupe.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Solde du groupe</p>
                        <p className="text-2xl font-bold text-orange-600">{parseFloat(selectedGroupe.solde).toLocaleString()} F CFA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cotisation</p>
                        <p className="text-2xl font-bold">{parseFloat(selectedGroupe.montant_cotisation).toLocaleString()} F</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fréquence</p>
                        <Badge variant="outline" className="mt-1">{selectedGroupe.frequence_cotisation}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Membres</p>
                        <p className="text-2xl font-bold">{selectedGroupe.membres.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Membres du groupe</CardTitle>
                      {selectedGroupe.responsable_id === user.id && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajouter un membre</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={addMembre} className="space-y-4">
                              <div>
                                <Label htmlFor="membre-email">Email du membre</Label>
                                <Input
                                  id="membre-email"
                                  type="email"
                                  placeholder="email@exemple.com"
                                  value={newMembreEmail}
                                  onChange={(e) => setNewMembreEmail(e.target.value)}
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                                Ajouter le membre
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedGroupe.membres.map((membre) => (
                        <div key={membre.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{membre.prenom} {membre.nom}</p>
                            <p className="text-sm text-muted-foreground">{membre.email}</p>
                          </div>
                          <Badge variant={membre.statut === 'actif' ? 'default' : 'secondary'}>
                            {membre.statut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Historique des transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucune transaction</p>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'cotisation' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {transaction.type === 'cotisation' ? (
                                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.membre_prenom} {transaction.membre_nom}</p>
                                <p className="text-sm text-muted-foreground">{transaction.type}</p>
                                {transaction.description && (
                                  <p className="text-xs text-muted-foreground">{transaction.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.type === 'cotisation' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'cotisation' ? '+' : '-'}
                                {parseFloat(transaction.montant).toLocaleString()} F
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nouvelle transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => { newTransaction.groupe_id = selectedGroupe.id; createTransaction(e); }} className="space-y-4">
                      <div>
                        <Label htmlFor="montant-transaction">Montant (F CFA)</Label>
                        <Input
                          id="montant-transaction"
                          type="number"
                          placeholder="5000"
                          value={newTransaction.montant}
                          onChange={(e) => setNewTransaction({ ...newTransaction, montant: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type-transaction">Type</Label>
                        <Select
                          value={newTransaction.type}
                          onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cotisation">Cotisation</SelectItem>
                            <SelectItem value="retrait">Retrait</SelectItem>
                            <SelectItem value="credit">Crédit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description-transaction">Description (optionnel)</Label>
                        <Textarea
                          id="description-transaction"
                          placeholder="Note..."
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                        Enregistrer la transaction
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      Votes actifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {votes.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">Aucun vote en cours</p>
                    ) : (
                      <div className="space-y-3">
                        {votes.map((vote) => (
                          <div key={vote.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{vote.titre}</p>
                            <p className="text-xs text-muted-foreground mt-1">{vote.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant={vote.statut === 'en_cours' ? 'default' : 'secondary'}>
                                {vote.statut}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {vote.total_votes} vote(s)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
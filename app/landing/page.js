'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Wallet, TrendingUp, Shield, Bell, Vote, BarChart3, Clock, Smartphone as Phone, Globe, ArrowRight, Star, Target, Zap, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-blue-900">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-white">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-1">
                🚀 La solution #1 en Afrique francophone
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Gérez vos tontines en toute transparence
              </h2>
              <p className="text-xl mb-8 text-white/90">
                SYFARI digitalise la gestion de vos groupes d'épargne collaborative. Simple, sécurisé et 100% transparent.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/login">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <a href="/login">
                  <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                    Se connecter
                  </Button>
                </a>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/80">Groupes actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5000+</div>
                  <div className="text-white/80">Utilisateurs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-white/80">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">Cotisation reçue</div>
                      <div className="text-sm text-green-700">+10,000 F CFA</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">Nouveau membre</div>
                      <div className="text-sm text-blue-700">Aya a rejoint le groupe</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-400 transition">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-orange-900">Rappel automatique</div>
                      <div className="text-sm text-orange-700">Cotisation à venir</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              Fonctionnalités
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour digitaliser et sécuriser la gestion de vos tontines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Gestion des cotisations</CardTitle>
                <CardDescription>
                  Suivez toutes les cotisations en temps réel avec historique complet et rapports détaillés
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Gestion des membres</CardTitle>
                <CardDescription>
                  Ajoutez, gérez et suivez tous vos membres facilement avec des rôles personnalisés
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>100% Sécurisé</CardTitle>
                <CardDescription>
                  Vos données sont cryptées et protégées avec les meilleurs standards de sécurité
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Rappels automatiques</CardTitle>
                <CardDescription>
                  Recevez des notifications SMS et email pour ne jamais oublier une cotisation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Vote className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Système de vote</CardTitle>
                <CardDescription>
                  Prenez des décisions démocratiques avec un système de vote intégré et transparent
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-yellow-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Tableaux de bord</CardTitle>
                <CardDescription>
                  Visualisez vos statistiques et l'évolution de votre groupe en un coup d'œil
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
                Pourquoi SYFARI ?
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Terminé les cahiers et les erreurs de calcul</h2>
              <p className="text-lg text-gray-600 mb-8">
                SYFARI remplace les méthodes traditionnelles par une solution moderne, automatisée et transparente.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Zéro erreur de calcul</h3>
                    <p className="text-gray-600">Tous les calculs sont automatiques et vérifiés</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Transparence totale</h3>
                    <p className="text-gray-600">Tous les membres voient l'historique complet</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Gain de temps</h3>
                    <p className="text-gray-600">Plus besoin de tout noter manuellement</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Accessible partout</h3>
                    <p className="text-gray-600">Sur mobile, tablette ou ordinateur</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <Clock className="w-8 h-8 text-orange-500 mb-2" />
                  <CardTitle className="text-2xl">90%</CardTitle>
                  <CardDescription>
                    Des cotisations payées à temps grâce aux rappels automatiques
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white mt-8">
                <CardHeader>
                  <Phone className="w-8 h-8 text-blue-500 mb-2" />
                  <CardTitle className="text-2xl">100%</CardTitle>
                  <CardDescription>
                    Mobile-first pour une utilisation facile partout
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle className="text-2xl">0%</CardTitle>
                  <CardDescription>
                    De fraude grâce à la transparence totale
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white mt-8">
                <CardHeader>
                  <Globe className="w-8 h-8 text-purple-500 mb-2" />
                  <CardTitle className="text-2xl">24/7</CardTitle>
                  <CardDescription>
                    Accès permanent à vos données en temps réel
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              Témoignages
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "SYFARI a transformé la gestion de notre tontine familiale. Plus de disputes, tout est clair et transparent !"
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Aya Kouassi</p>
                  <p className="text-sm text-gray-500">Responsable, Tontine Familiale</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "Enfin une solution moderne pour nos associations ! Les rappels automatiques ont tout changé."
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Kouadio Jean</p>
                  <p className="text-sm text-gray-500">Président, Association des Jeunes</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "Simple, efficace et sécurisé. Je recommande SYFARI à tous les groupes d'épargne !"
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Fatou Traoré</p>
                  <p className="text-sm text-gray-500">Membre, Tontine des Femmes</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Tarifs
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Un plan pour chaque groupe</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Démarrez simplement, puis évoluez au rythme de votre communauté. Le choix du forfait se fait en quelques secondes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Basique</CardTitle>
                <CardDescription>Jusqu'à 10 membres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-orange-600">2 000 F<span className="text-base text-gray-600">/mois</span></div>
                <ul className="space-y-2 text-gray-700">
                  {['1 groupe actif', 'Historique des transactions', 'Rappels de base'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/pricing?plan=basique" className="inline-flex w-full">
                  <Button variant="outline" className="w-full">Choisir</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500 bg-orange-50 hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Standard</CardTitle>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">Recommandé</Badge>
                </div>
                <CardDescription>Jusqu'à 50 membres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-orange-600">5 000 F<span className="text-base text-gray-600">/mois</span></div>
                <ul className="space-y-2 text-gray-700">
                  {['Groupes illimités', 'Votes du groupe', 'Support prioritaire'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/pricing?plan=standard" className="inline-flex w-full">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Choisir</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Illimité + support VIP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-orange-600">10 000 F<span className="text-base text-gray-600">/mois</span></div>
                <ul className="space-y-2 text-gray-700">
                  {['Rapports avancés', 'Rôles & permissions', 'Assistance onboarding'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/pricing?plan=premium" className="inline-flex w-full">
                  <Button variant="outline" className="w-full">Choisir</Button>
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex justify-center">
            <a href="/pricing">
              <Button size="lg" variant="outline">Voir tous les détails</Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Prêt à transformer votre gestion de tontine ?</h2>
            <p className="text-xl text-gray-600 mb-8">Rejoignez des milliers de groupes qui font confiance à SYFARI pour gérer leurs épargnes collectivement</p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-all hover:scale-105">
                <CardHeader>
                  <Zap className="w-8 h-8 text-orange-600 mb-2" />
                  <CardTitle>Mise en place rapide</CardTitle>
                  <CardDescription>Créez votre groupe en 2 minutes</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all hover:scale-105">
                <CardHeader>
                  <Lock className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>100% Sécurisé</CardTitle>
                  <CardDescription>Vos données cryptées et protégées</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all hover:scale-105">
                <CardHeader>
                  <Target className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Support 24/7</CardTitle>
                  <CardDescription>Nous sommes toujours là pour vous</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="/pricing">
                <Button size="lg" variant="outline">
                  Voir les tarifs
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

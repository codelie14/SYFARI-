import Link from 'next/link'
import { ArrowRight, CalendarDays, Tag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Blog — SYFARI',
  description: 'Conseils, bonnes pratiques et actualités autour des tontines et de SYFARI.',
}

export default function BlogPage() {
  const posts = [
    {
      title: 'Digitaliser une tontine : par où commencer ?',
      date: 'Décembre 2025',
      tag: 'Guide',
      excerpt:
        "Structurer les cotisations, définir les règles et mettre en place des outils simples pour éviter les erreurs et améliorer la transparence.",
    },
    {
      title: '5 indicateurs pour suivre la santé financière du groupe',
      date: 'Décembre 2025',
      tag: 'Finance',
      excerpt:
        "Solde, arriérés, fréquence des transactions, participation et visibilité : des indicateurs concrets pour piloter le groupe.",
    },
    {
      title: 'Sécurité : bonnes pratiques pour protéger le compte responsable',
      date: 'Décembre 2025',
      tag: 'Sécurité',
      excerpt:
        'Mot de passe, appareils, partage des accès : les habitudes essentielles pour réduire le risque et garder le contrôle.',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
        <div>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Blog</h1>
          <p className="text-gray-700 max-w-2xl">
            Ressources et bonnes pratiques pour gérer une tontine de façon simple, transparente et sécurisée.
          </p>
        </div>
        <Link href="/landing" className="inline-flex">
          <Button variant="outline">
            Découvrir SYFARI
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {posts.map((p) => (
          <Card key={p.title} className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="w-4 h-4" />
                <span>{p.date}</span>
              </div>
              <CardTitle className="mt-2">{p.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Tag className="w-4 h-4" />
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">{p.tag}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{p.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-lg bg-white shadow hover:shadow-md transition">
        <h2 className="text-xl font-semibold text-orange-600 mb-2">Bientôt</h2>
        <p className="text-gray-700">
          Les articles complets et les catégories seront ajoutés au fur et à mesure. En attendant, consultez la FAQ et
          la page Tarifs pour découvrir les fonctionnalités.
        </p>
      </div>
    </div>
  )
}


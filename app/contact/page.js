import Link from 'next/link'
import { Mail, Phone, MessageSquare, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Contact — SYFARI',
  description: 'Contacter SYFARI : support, questions, partenariats.',
}

export default function ContactPage() {
  const email = 'archangeyatte@gmail.com'
  const tel = '+225 07 00 00 00 00'
  const whatsapp = 'https://wa.me/'

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
        <div>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Contact</h1>
          <p className="text-gray-700 max-w-2xl">
            Une question sur SYFARI, un besoin de support ou une demande de partenariat ? Écrivez-nous et nous vous
            répondrons au plus vite.
          </p>
        </div>
        <Link href="/landing" className="inline-flex">
          <Button variant="outline">
            Retour à l’accueil
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              Email
            </CardTitle>
            <CardDescription>Support et demandes générales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-gray-800 font-medium">{email}</div>
            <a href={`mailto:${email}?subject=Contact%20SYFARI`} className="inline-flex">
              <Button className="bg-orange-500 hover:bg-orange-600">Envoyer un email</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-600" />
              Téléphone
            </CardTitle>
            <CardDescription>Horaires : 9h–18h (Lun–Ven)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-gray-800 font-medium">{tel}</div>
            <a href={`tel:${tel.replace(/\s/g, '')}`} className="inline-flex">
              <Button variant="outline">Appeler</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              WhatsApp
            </CardTitle>
            <CardDescription>Échange rapide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-gray-700">
              Envoyez-nous un message sur WhatsApp (lien à configurer).
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex">
              <Button className="bg-orange-500 hover:bg-orange-600">Ouvrir WhatsApp</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Localisation
            </CardTitle>
            <CardDescription>Informations générales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <div>Abidjan, Côte d’Ivoire</div>
            <div className="text-sm text-gray-500">
              Adresse détaillée disponible sur demande.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-white shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Support</h2>
          <p className="text-gray-700">
            Pour accélérer le traitement, indiquez votre email de connexion et une description précise (capture si
            possible).
          </p>
        </div>
        <div className="p-6 rounded-lg bg-white shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Partenariats</h2>
          <p className="text-gray-700">
            Vous souhaitez intégrer SYFARI à votre organisation ou proposer une collaboration ? Contactez-nous par email.
          </p>
        </div>
      </div>
    </div>
  )
}


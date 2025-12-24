export const metadata = {
  title: 'Politique de confidentialité — SYFARI',
  description: 'Politique de confidentialité et protection des données sur SYFARI.',
}

export default function PolicyPage() {
  const sections = [
    {
      title: '1. Données collectées',
      items: [
        "Données de compte : nom, prénom, email, téléphone (si fourni).",
        "Données d'usage : interactions avec la Plateforme (ex : pages consultées, actions effectuées).",
        "Données de tontine : groupes, membres, transactions, votes et informations associées.",
      ],
    },
    {
      title: '2. Finalités',
      items: [
        'Fournir et sécuriser le service (authentification, accès, prévention fraude).',
        'Améliorer la Plateforme (qualité, performance, ergonomie).',
        'Support et communication liée au service (assistance, notifications).',
      ],
    },
    {
      title: '3. Partage des données',
      items: [
        "Les données ne sont pas vendues. Elles peuvent être partagées avec des prestataires strictement nécessaires au fonctionnement (hébergement, outils techniques), sous engagements de confidentialité.",
        "En cas d'obligation légale, certaines données peuvent être communiquées aux autorités compétentes.",
      ],
    },
    {
      title: '4. Conservation',
      items: [
        "Les données sont conservées le temps nécessaire aux finalités ci-dessus, puis supprimées ou anonymisées selon les obligations légales applicables.",
      ],
    },
    {
      title: '5. Sécurité',
      items: [
        'Mesures techniques et organisationnelles pour protéger les données (contrôles d’accès, chiffrement selon contexte, supervision).',
        'Vous êtes responsable de la protection de votre mot de passe et de vos appareils.',
      ],
    },
    {
      title: '6. Vos droits',
      items: [
        "Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ainsi que l'opposition ou la limitation de certains traitements, selon la loi applicable.",
        "Pour exercer vos droits, utilisez la page Contact.",
      ],
    },
    {
      title: '7. Cookies',
      items: [
        "SYFARI peut utiliser des cookies/stockage local nécessaires au fonctionnement (ex : session). D'autres cookies, s'ils existent, sont utilisés pour améliorer l'expérience.",
      ],
    },
    {
      title: '8. Modifications de la politique',
      items: [
        'Cette politique peut évoluer. La version à jour est publiée sur cette page.',
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Politique de confidentialité</h1>
      <p className="text-gray-700 mb-10">
        Cette politique décrit comment SYFARI collecte, utilise et protège vos données lors de l'utilisation de la
        Plateforme.
      </p>

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-orange-600 mb-3">{s.title}</h2>
            <ul className="space-y-2 text-gray-700 list-disc pl-5">
              {s.items.map((item) => (
                <li key={item} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-lg border bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          Dernière mise à jour : 24/12/2025.
        </p>
      </div>
    </div>
  )
}


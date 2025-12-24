export const metadata = {
  title: 'CGV — SYFARI',
  description: "Conditions générales de vente et d'utilisation de SYFARI.",
}

export default function CGVPage() {
  const sections = [
    {
      title: '1. Objet',
      body: "Les présentes conditions générales encadrent l'accès et l'utilisation de SYFARI (la « Plateforme ») et des services associés de gestion de tontines et groupes d'épargne.",
    },
    {
      title: '2. Accès au service',
      body: "L'accès à certaines fonctionnalités nécessite la création d'un compte. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte.",
    },
    {
      title: '3. Utilisation acceptable',
      body: "Vous vous engagez à utiliser la Plateforme de manière licite, sans porter atteinte aux droits de tiers, sans tenter d'accéder à des données non autorisées, et sans perturber la sécurité ou la disponibilité du service.",
    },
    {
      title: '4. Données et contenu',
      body: "Vous conservez la propriété de vos données. Vous accordez à SYFARI une licence limitée et nécessaire au traitement et à l'affichage de vos données pour fournir le service (ex : transactions, membres, rapports).",
    },
    {
      title: '5. Tarifs et paiement',
      body: "Les tarifs peuvent évoluer. Les modalités de paiement, d'abonnement et de facturation sont indiquées sur la page Tarifs. Toute période commencée est due, sauf disposition contraire applicable.",
    },
    {
      title: '6. Disponibilité',
      body: "SYFARI vise une disponibilité élevée, mais ne peut garantir l'absence d'interruptions (maintenance, incidents, force majeure). Des sauvegardes et mesures de sécurité sont mises en place selon les meilleures pratiques.",
    },
    {
      title: '7. Responsabilité',
      body: "Dans la limite autorisée par la loi, SYFARI ne saurait être tenu responsable des dommages indirects, pertes de profits, pertes de données dues à un usage non conforme ou à des circonstances hors de son contrôle.",
    },
    {
      title: '8. Résiliation',
      body: "Vous pouvez cesser d'utiliser la Plateforme à tout moment. SYFARI peut suspendre ou résilier l'accès en cas de violation des présentes conditions ou de risque de sécurité avéré.",
    },
    {
      title: '9. Modifications',
      body: "SYFARI peut modifier les présentes conditions afin de refléter des évolutions légales, techniques ou fonctionnelles. La version à jour est publiée sur cette page.",
    },
    {
      title: '10. Contact',
      body: "Pour toute question relative aux conditions, vous pouvez nous contacter via la page Contact.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Conditions Générales (CGV)</h1>
      <p className="text-gray-700 mb-10">
        Ce document présente les conditions générales applicables à l'utilisation de SYFARI. En accédant à la
        Plateforme, vous acceptez ces conditions.
      </p>

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-orange-600 mb-2">{s.title}</h2>
            <p className="text-gray-700 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-lg border bg-orange-50 border-orange-200">
        <p className="text-sm text-orange-900">
          Dernière mise à jour : 24/12/2025.
        </p>
      </div>
    </div>
  )
}


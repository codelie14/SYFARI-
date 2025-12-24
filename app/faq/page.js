export const metadata = {
  title: 'FAQ — SYFARI',
  description: "Questions fréquentes sur l'utilisation de SYFARI et la gestion des tontines.",
}

export default function FAQPage() {
  const faqs = [
    { q: 'Comment créer un groupe ?', a: 'Allez dans Mes groupes puis cliquez sur "Créer un groupe" et suivez le formulaire.' },
    { q: 'Quels moyens de paiement sont supportés ?', a: 'Nous prenons en charge PayDunya (Orange Money, MTN, cartes). Intégration en sandbox pour tests.' },
    { q: 'Puis-je exporter les données ?', a: 'Oui, vous pouvez exporter l\'historique complet des transactions en PDF ou CSV.' },
    { q: 'Comment ajouter des membres ?', a: 'Utilisez l\'option "Ajouter un membre" et entrez leur email ou numéro de téléphone.' },
    { q: 'Quand dois-je choisir un forfait ?', a: 'Après votre inscription/connexion, SYFARI vous redirige vers la page Tarifs pour sélectionner un forfait et finaliser la configuration.' },
    { q: 'Puis-je changer de forfait ?', a: 'Oui. Vous pouvez changer de forfait à tout moment en revenant sur la page Tarifs.' },
    { q: 'Que se passe-t-il si un membre ne cotise pas ?', a: 'Vous visualisez les retards, pouvez relancer automatiquement et garder une trace des transactions et pénalités si nécessaire.' },
    { q: 'Les membres voient-ils tout ?', a: 'Selon l\'organisation du groupe, les transactions et décisions peuvent être consultées pour garantir la transparence.' },
    { q: 'Mes données sont-elles en sécurité ?', a: 'Nous appliquons des bonnes pratiques de sécurité : contrôle d\'accès, protection des sessions et stockage sécurisé des informations.' },
    { q: 'Puis-je gérer plusieurs groupes ?', a: 'Oui. Selon votre forfait, vous pouvez gérer un ou plusieurs groupes et suivre l\'activité sur votre tableau de bord.' },
  ]

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Questions Fréquentes</h1>
      <p className="text-center text-gray-600 mb-12">Trouvez des réponses à vos questions sur SYFARI</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer group"
          >
            <summary className="font-semibold text-gray-900 group-open:text-orange-600 flex items-center justify-between">
              {faq.q}
              <span className="group-open:rotate-180 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-gray-700 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Vous ne trouvez pas votre réponse ?</h2>
        <p className="text-gray-700 mb-4">
          Contactez-nous et décrivez votre besoin (type de groupe, nombre de membres, fréquence de cotisation).
        </p>
        <a
          href="/contact"
          className="inline-flex px-5 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          Contacter le support
        </a>
      </div>
    </div>
  )
}

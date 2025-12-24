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
    </div>
  )
}

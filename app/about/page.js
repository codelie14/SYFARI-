export const metadata = {
  title: 'À propos — SYFARI',
  description: 'SYFARI digitalise la gestion des tontines : sécurité, transparence et automatisation.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">À propos de SYFARI</h1>
      <p className="text-lg text-gray-700 mb-8 max-w-2xl">
        SYFARI est une plateforme SaaS dédiée à la gestion digitale des tontines et groupes d'épargne collaborative. 
        Nous aidons les responsables à automatiser les cotisations, suivre les transactions et garantir la transparence.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold mb-3 text-orange-600">Transparence</h3>
          <p className="text-gray-700">Tous les membres voient les transactions en temps réel et comprennent où va l'argent.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold mb-3 text-orange-600">Sécurité</h3>
          <p className="text-gray-700">Vos données sont cryptées et protégées avec les meilleurs standards de sécurité.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold mb-3 text-orange-600">Accessibilité</h3>
          <p className="text-gray-700">Interface simple et mobile-first pour un accès facile n'importe où, n'importe quand.</p>
        </div>
      </div>
    </div>
  )
}

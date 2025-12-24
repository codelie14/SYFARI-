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

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Notre mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Donner aux communautés un outil simple pour gérer l'épargne collective, réduire les conflits, et bâtir une
            confiance durable grâce à la transparence.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Notre vision</h2>
          <p className="text-gray-700 leading-relaxed">
            Faire de SYFARI la référence de la gestion digitale des tontines en Afrique francophone, avec des outils
            modernes, sécurisés et pensés pour le terrain.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Comment ça marche</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300">
            <div className="text-sm font-semibold text-orange-600 mb-2">Étape 1</div>
            <h3 className="text-xl font-semibold mb-2">Créez votre groupe</h3>
            <p className="text-gray-700">Définissez le montant, la fréquence et les règles du groupe.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300">
            <div className="text-sm font-semibold text-orange-600 mb-2">Étape 2</div>
            <h3 className="text-xl font-semibold mb-2">Invitez les membres</h3>
            <p className="text-gray-700">Ajoutez vos membres et suivez leur participation au fil du temps.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300">
            <div className="text-sm font-semibold text-orange-600 mb-2">Étape 3</div>
            <h3 className="text-xl font-semibold mb-2">Suivez et décidez</h3>
            <p className="text-gray-700">Transactions, rappels et votes : tout est centralisé et traçable.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg border">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Prêt à démarrer ?</h2>
            <p className="text-gray-700">
              Choisissez un forfait et créez votre premier groupe en quelques minutes.
            </p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <a href="/pricing" className="px-5 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition text-center">
              Voir les tarifs
            </a>
            <a href="/contact" className="px-5 py-3 rounded-lg border bg-white text-gray-900 font-semibold hover:bg-gray-50 transition text-center">
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

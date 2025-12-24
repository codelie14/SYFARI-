export const metadata = {
  title: 'Tarifs — SYFARI',
  description: 'Plans et tarification SYFARI',
}

export default function PricingPage() {
  const plans = [
    { name: 'Basique', price: '2 000', desc: 'Jusqu a 10 membres' },
    { name: 'Standard', price: '5 000', desc: 'Jusqu a 50 membres', highlighted: true },
    { name: 'Premium', price: '10 000', desc: 'Illimite + support VIP' },
  ]

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold mb-4 text-center">Plans & Tarifs</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Choisissez le plan adapte a votre groupe</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
              plan.highlighted ? 'border-2 border-orange-500 bg-orange-50' : 'bg-white'
            }`}
          >
            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-6">{plan.desc}</p>
            <div className="text-4xl font-bold text-orange-600 mb-6">{plan.price} F<span className="text-lg">/mois</span></div>
            <button className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium">
              Commencer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

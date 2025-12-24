import PricingSelector from '@/components/pricing-selector'
import { Suspense } from 'react'

export const metadata = {
  title: 'Tarifs — SYFARI',
  description: 'Plans et tarification SYFARI',
}

export default function PricingPage() {
  const plans = [
    {
      id: 'basique',
      name: 'Basique',
      price: '2 000',
      desc: "Jusqu'à 10 membres",
      features: [
        '1 groupe actif',
        'Cotisations et retraits',
        'Historique des transactions',
        'Rappels de base',
      ],
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '5 000',
      desc: "Jusqu'à 50 membres",
      highlighted: true,
      features: [
        'Groupes illimités',
        'Cotisations et retraits',
        'Exports (CSV/PDF) basiques',
        'Votes et décisions du groupe',
        'Support prioritaire',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '10 000',
      desc: 'Illimité + support VIP',
      features: [
        'Tout Standard',
        'Rôles et permissions avancés',
        'Rapports avancés',
        'Assistance onboarding',
        'Support VIP',
      ],
    },
  ]

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10 text-center text-gray-600">Chargement...</div>}>
      <PricingSelector plans={plans} />
    </Suspense>
  )
}

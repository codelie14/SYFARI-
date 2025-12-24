'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function PricingSelector({ plans }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuth, setIsAuth] = useState(false)
  const [currentPlanId, setCurrentPlanId] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [open, setOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [paymentNotice, setPaymentNotice] = useState(null)

  const onboarding = searchParams.get('onboarding') === '1'
  const planQuery = searchParams.get('plan')
  const nextQuery = searchParams.get('next')
  const paymentQuery = searchParams.get('payment')
  const tokenQuery = searchParams.get('token')

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  )

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuth(!!token)
    setCurrentPlanId(localStorage.getItem('plan'))
  }, [])

  useEffect(() => {
    if (!isAuth) return
    if (!planQuery) return
    const exists = plans.some((p) => p.id === planQuery)
    if (!exists) return
    setSelectedPlanId(planQuery)
    setOpen(true)
  }, [isAuth, planQuery, plans])

  useEffect(() => {
    if (!paymentQuery) return

    if (paymentQuery === 'cancel') {
      setPaymentNotice({ type: 'warning', title: 'Paiement annulé', text: 'Vous pouvez relancer le paiement quand vous voulez.' })
      return
    }

    if (paymentQuery !== 'success') return

    if (!tokenQuery) {
      setPaymentNotice({ type: 'warning', title: 'Paiement en cours', text: 'Nous attendons la confirmation du paiement.' })
      return
    }

    if (!isAuth) {
      setPaymentNotice({ type: 'warning', title: 'Connexion requise', text: 'Connectez-vous pour finaliser l’activation de votre forfait.' })
      return
    }

    const run = async () => {
      try {
        const authToken = localStorage.getItem('token')
        const res = await fetch(`/api/payments/status?token=${encodeURIComponent(tokenQuery)}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data?.error || 'Impossible de vérifier le paiement')
          return
        }

        if (data.status === 'COMPLETED') {
          localStorage.setItem('plan', data.plan_id)
          setCurrentPlanId(data.plan_id)

          const userRaw = localStorage.getItem('user')
          if (userRaw) {
            try {
              const parsed = JSON.parse(userRaw)
              localStorage.setItem('user', JSON.stringify({ ...parsed, plan: data.plan_id }))
            } catch {
            }
          }

          toast.success('Forfait activé')
          router.push(nextQuery || '/dashboard')
          return
        }

        setPaymentNotice({
          type: 'warning',
          title: 'Paiement non confirmé',
          text: 'Le paiement est encore en cours. Réessayez dans quelques instants.',
        })
      } catch {
        toast.error('Erreur de connexion')
      }
    }

    run()
  }, [isAuth, nextQuery, paymentQuery, router, tokenQuery])

  const startCheckout = (planId) => {
    if (!isAuth) {
      const returnUrl = `/pricing?onboarding=1&plan=${encodeURIComponent(planId)}&next=${encodeURIComponent('/dashboard')}`
      router.push(`/login?next=${encodeURIComponent(returnUrl)}`)
      return
    }
    setSelectedPlanId(planId)
    setOpen(true)
  }

  const confirmPlan = async () => {
    if (!selectedPlan) return

    if (currentPlanId === selectedPlan.id) {
      setOpen(false)
      router.push(nextQuery || '/dashboard')
      return
    }

    setCheckoutLoading(true)
    try {
      const authToken = localStorage.getItem('token')
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          next: nextQuery || '/dashboard',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || 'Erreur lors du paiement')
        return
      }

      setOpen(false)
      window.location.href = data.invoice_url
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-center">Plans & Tarifs</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          Choisissez un plan adapté à la taille de votre groupe. Changez de forfait à tout moment.
        </p>
      </div>

      {onboarding && (
        <div className="max-w-4xl mx-auto mb-10 p-4 rounded-lg border bg-orange-50 border-orange-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-orange-900">Bienvenue sur SYFARI</div>
              <div className="text-sm text-orange-800">
                Choisissez votre forfait pour terminer la configuration et accéder à votre tableau de bord.
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentNotice && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="font-semibold text-blue-900">{paymentNotice.title}</div>
          <div className="text-sm text-blue-800 mt-1">{paymentNotice.text}</div>
        </div>
      )}

      {isAuth && currentPlanId && (
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-center">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Forfait actuel : {plans.find((p) => p.id === currentPlanId)?.name || currentPlanId}
          </Badge>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const active = currentPlanId === plan.id
          return (
            <Card
              key={plan.id}
              className={`shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                plan.highlighted ? 'border-2 border-orange-500 bg-orange-50' : 'bg-white'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {active && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Actif</Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600">{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-4xl font-bold text-orange-600">
                  {plan.price} F<span className="text-lg text-gray-600">/mois</span>
                </div>

                <ul className="space-y-2 text-gray-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.highlighted ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => startCheckout(plan.id)}
                  disabled={active}
                >
                  {active ? 'Forfait actif' : 'Choisir ce forfait'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le forfait</DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? `Vous êtes sur le point de choisir le forfait ${selectedPlan.name}.`
                : 'Sélectionnez un forfait.'}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
                  <div className="font-bold text-orange-600">{selectedPlan.price} F/mois</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{selectedPlan.desc}</div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {selectedPlan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={confirmPlan} disabled={!selectedPlan || checkoutLoading}>
              {checkoutLoading ? 'Redirection...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

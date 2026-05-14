import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [phase, setPhase] = useState(sessionId ? 'confirming' : 'no_session')
  const [detail, setDetail] = useState('')
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if (!sessionId) {
      setPhase('no_session')
      return
    }

    let cancelled = false
    const run = async () => {
      setPhase('confirming')
      setDetail('')
      try {
        const res = await fetch('/.netlify/functions/decrement-stock-after-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return

        if (res.ok && data.clearCart) {
          clearCart()
        }

        if (!res.ok) {
          setPhase('error')
          setDetail(data.error || 'No se pudo confirmar el pago con el servidor. Si Stripe cobró, guarda este enlace y escríbenos.')
          return
        }

        if (data.paid === false) {
          setPhase('pending')
          setDetail(
            'El pago aún no consta como completado. Espera unos segundos y recarga esta página, o revisa tu correo por la confirmación.'
          )
          return
        }

        setPhase('success')
        if (data.alreadyProcessed) {
          setDetail('Tu pedido ya estaba registrado. Gracias de nuevo.')
        }
      } catch (e) {
        console.error('Checkout success handler:', e)
        if (!cancelled) {
          setPhase('error')
          setDetail(e?.message || 'Error de red al confirmar el pedido.')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [sessionId, clearCart])

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {phase === 'confirming' && (
            <>
              <div className="w-20 h-20 rounded-full bg-sage-muted/30 text-sage flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl text-neutral-800 mb-2">Confirmando tu pago…</h1>
              <p className="text-neutral-600 text-sm">
                Un momento mientras actualizamos inventario y enviamos la confirmación por correo.
              </p>
            </>
          )}

          {phase === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h1 className="font-serif text-3xl text-neutral-800 mb-2">Gracias por tu pedido</h1>
              <p className="text-neutral-600 mb-4">
                Tu pago se registró correctamente. Deberías recibir un correo de confirmación en breve (revisa spam).
              </p>
              {detail ? <p className="text-sm text-neutral-500 mb-6">{detail}</p> : <div className="mb-6" />}
              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap mb-4">
                <Link to="/shop" className="btn-primary">
                  Seguir comprando
                </Link>
                <Link to="/contact#book" className="btn-outline">
                  Reservar consulta
                </Link>
                <InstagramDmCta className="btn-outline" />
              </div>
            </>
          )}

          {phase === 'pending' && (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10" />
              </div>
              <h1 className="font-serif text-2xl text-neutral-800 mb-2">Estamos confirmando el pago</h1>
              <p className="text-neutral-600 mb-4">{detail}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-outline btn-sm"
              >
                Recargar página
              </button>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h1 className="font-serif text-2xl text-neutral-800 mb-2">No pudimos finalizar desde aquí</h1>
              <p className="text-neutral-600 mb-4 text-sm">{detail}</p>
              <p className="text-xs text-neutral-500 mb-6 break-all">Ref. sesión: {sessionId}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                <Link to="/shop" className="btn-primary">
                  Volver a la tienda
                </Link>
                <a href="mailto:magaribyelena@gmail.com" className="btn-outline">
                  Escribir a Magari
                </a>
              </div>
            </>
          )}

          {phase === 'no_session' && (
            <>
              <div className="w-20 h-20 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h1 className="font-serif text-2xl text-neutral-800 mb-2">Falta el comprobante de pago</h1>
              <p className="text-neutral-600 mb-6 text-sm">
                Esta página necesita el enlace que Stripe envía al terminar el pago. Si ya pagaste, revisa tu correo o
                el historial de compras; si cerraste la ventana antes de volver aquí, escríbenos con el cargo de Stripe.
              </p>
              <Link to="/shop" className="btn-primary">
                Ir a la tienda
              </Link>
            </>
          )}
        </div>
      </div>

      <PageBottomCta
        headline="Thank you for supporting slow-made"
        body="Have a styling question? We are one message away."
      />
    </div>
  )
}

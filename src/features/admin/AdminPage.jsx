import { useState, useEffect, useRef } from 'react'
import {
  LogIn,
  Package,
  ShoppingBag,
  Users,
  MessageSquare,
  Settings,
  TrendingUp,
  DollarSign,
  Bell,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { getAdminAuthRedirectUrl } from '../../utils/siteOrigin'
import { useNotificationsStore } from '../../store/notificationsStore'
import ConsultationsAdminView from '../../components/admin/ConsultationsAdminView'
import AvailabilityAdminView from '../../components/admin/AvailabilityAdminView'
import ListingsAdminView from '../../components/admin/ListingsAdminView'
import { MAGARI_ADMIN_EMAIL, isMagariAdminEmail } from '../../constants/admin'
import {
  DashboardView,
  ProductsView,
  OrdersView,
  PayoutsView,
  ServicesView,
  VendorsView,
  ReviewsView,
  SettingsView,
} from './adminViews'

function AdminNotificationsDropdown({ notifications, error, onMarkAsRead, onMarkAllAsRead, onClose, onNotificationClick }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[400px] overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg z-50">
        <div className="p-3 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <span className="font-semibold text-neutral-700">Notificaciones</span>
          {notifications.some(n => !n.read) && (
            <button type="button" onClick={onMarkAllAsRead} className="text-sm text-sage hover:underline">
              Marcar todas leídas
            </button>
          )}
        </div>
        <div className="divide-y divide-neutral-100">
          {error && (
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <p className="text-amber-800 text-sm font-medium">No se pudieron cargar las notificaciones.</p>
              {error.includes('configurado') ? (
                <p className="text-amber-700 text-xs mt-1">En Netlify añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Environment variables y vuelve a desplegar.</p>
              ) : (
                <p className="text-amber-700 text-xs mt-1">Ejecuta en Supabase (SQL Editor) la migración: <code className="bg-amber-100 px-1 rounded">20260128400000_notifications_and_orders.sql</code></p>
              )}
            </div>
          )}
          {!error && notifications.length === 0 && (
            <p className="p-4 text-neutral-500 text-sm">No hay notificaciones aún. Aparecerán cuando alguien solicite ser vendor o haga una compra.</p>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 text-left hover:bg-neutral-50 cursor-pointer ${!n.read ? 'bg-sage/5' : ''}`}
              onClick={() => {
                if (!n.read) onMarkAsRead(n.id)
                if (onNotificationClick) onNotificationClick(n)
              }}
            >
              <p className="font-medium text-neutral-800 text-sm">{n.title}</p>
              <p className="text-neutral-600 text-xs mt-0.5">{n.body}</p>
              <p className="text-neutral-400 text-xs mt-1">
                {n.created_at ? new Date(n.created_at).toLocaleString('es-PR') : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function getAuthErrorDetail(authErr) {
  const msg = (authErr?.message || '').toLowerCase()
  const code = authErr?.code || authErr?.status || ''
  if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
    return 'Tu usuario existe pero el correo no está confirmado. En Supabase: Authentication → Providers → Email, desactiva temporalmente "Confirm email" o confirma el usuario desde el panel.'
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return [
      '1) Contraseña incorrecta → en Supabase: Authentication → Users → tu usuario → menú (⋮) → Reset password, o usa "Enviar enlace…" abajo.',
      '2) Si creaste la cuenta solo con Google, no hay contraseña: usa "Continuar con Google".',
      '3) Comprueba que VITE_SUPABASE_URL en Netlify sea el mismo proyecto donde está el usuario.',
    ].join(' ')
  }
  return ''
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [highlightedApplicationId, setHighlightedApplicationId] = useState(null)
  const [email, setEmail] = useState(MAGARI_ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginInfo, setLoginInfo] = useState('')
  const [oauthBusy, setOauthBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [recoveryUi, setRecoveryUi] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryBusy, setRecoveryBusy] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const inPasswordRecovery = useRef(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { items: notifications, unreadCount, error: notificationsError, fetchForAdmin, markAsRead, markAllAsRead } = useNotificationsStore()

  useEffect(() => {
    if (isLoggedIn) fetchForAdmin()
  }, [isLoggedIn, fetchForAdmin])

  /** Detect recovery link in URL (hash) before listener runs. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const h = window.location.hash
    if (h.includes('type=recovery') || h.includes('type%3Drecovery')) {
      inPasswordRecovery.current = true
      setRecoveryUi(true)
      setIsLoggedIn(false)
    }
  }, [])

  /** Restore admin session; handle password recovery flow. */
  useEffect(() => {
    if (!supabase) return undefined
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        inPasswordRecovery.current = true
        setRecoveryUi(true)
        setIsLoggedIn(false)
        return
      }
      if (inPasswordRecovery.current) {
        if (event === 'USER_UPDATED') {
          inPasswordRecovery.current = false
          setRecoveryUi(false)
          const em = (session?.user?.email || '').trim().toLowerCase()
          setIsLoggedIn(Boolean(session && isMagariAdminEmail(em)))
        }
        return
      }
      const em = (session?.user?.email || '').trim().toLowerCase()
      setIsLoggedIn(Boolean(session && isMagariAdminEmail(em)))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleNotificationClick = (notification) => {
    const payload = notification?.payload || {}
    if (notification.type === 'vendor_application' && payload.application_id) {
      setActiveTab('vendors')
      setHighlightedApplicationId(payload.application_id)
      setShowNotifications(false)
    } else if (notification.type && notification.type.toLowerCase().includes('order')) {
      setActiveTab('orders')
      setShowNotifications(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginInfo('')
    const trimmedEmail = (email || '').trim().toLowerCase()
    if (!isMagariAdminEmail(trimmedEmail)) {
      setLoginError('Este acceso solo está habilitado para el email de administración.')
      return
    }
    if (!supabase) {
      setLoginError('Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el entorno y vuelve a desplegar.')
      return
    }

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (authErr) {
      const msg = authErr.message || 'Error de autenticación'
      const detail = getAuthErrorDetail(authErr)
      setLoginError(detail ? `${msg}\n\n${detail}` : msg)
      return
    }

    const sessionEmail = (data?.user?.email || '').trim().toLowerCase()
    if (!isMagariAdminEmail(sessionEmail)) {
      await supabase.auth.signOut()
      setLoginError('Cuenta no autorizada para este panel.')
      return
    }

    setIsLoggedIn(true)
  }

  const handleGoogleLogin = async () => {
    setLoginError('')
    setLoginInfo('')
    if (!supabase) {
      setLoginError('Supabase no está configurado.')
      return
    }
    const trimmedEmail = (email || '').trim().toLowerCase()
    if (!isMagariAdminEmail(trimmedEmail)) {
      setLoginError('Usa el email de administración antes de continuar con Google.')
      return
    }
    setOauthBusy(true)
    const redirectTo = getAdminAuthRedirectUrl() || `${window.location.origin}/admin`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) {
      setOauthBusy(false)
      setLoginError(
        `${error.message}. Si no usas Google en Supabase, habilita el proveedor en Authentication → Providers → Google y añade esta URL en Redirect URLs: ${redirectTo}`
      )
      return
    }
    if (data?.url) {
      window.location.href = data.url
      return
    }
    setOauthBusy(false)
    setLoginError('No se recibió la URL de Google. Revisa la configuración del proveedor en Supabase.')
  }

  const handleSendResetEmail = async () => {
    setLoginError('')
    setLoginInfo('')
    if (!supabase) {
      setLoginError('Supabase no está configurado.')
      return
    }
    const trimmedEmail = (email || '').trim().toLowerCase()
    if (!isMagariAdminEmail(trimmedEmail)) {
      setLoginError('El email debe ser el de administración.')
      return
    }
    setResetBusy(true)
    const redirectTo = getAdminAuthRedirectUrl() || `${window.location.origin}/admin`
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })
    setResetBusy(false)
    if (error) {
      setLoginError(error.message || 'No se pudo enviar el correo.')
      return
    }
    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    const usedPublic = Boolean((import.meta.env.VITE_PUBLIC_SITE_URL || '').trim())
    setLoginInfo(
      [
        `Revisa la bandeja de ${trimmedEmail} (y spam). El enlace te llevará a: ${redirectTo}`,
        '',
        'En Supabase → Authentication → URL configuration:',
        `• Añade "${redirectTo}" en Redirect URLs.`,
        '• Site URL debe ser tu dominio real (p. ej. https://casamagari.com), no localhost.',
        usedPublic || !isLocal
          ? ''
          : '• Estás en localhost: en Netlify añade VITE_PUBLIC_SITE_URL=https://casamagari.com y vuelve a pedir el enlace para que el mail use el sitio en vivo.',
      ]
        .filter(Boolean)
        .join('\n')
    )
  }

  const handleSaveNewPassword = async (e) => {
    e.preventDefault()
    setRecoveryError('')
    if (newPassword.length < 8) {
      setRecoveryError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Las contraseñas no coinciden.')
      return
    }
    if (!supabase) {
      setRecoveryError('Supabase no está configurado.')
      return
    }
    setRecoveryBusy(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setRecoveryBusy(false)
    if (error) {
      setRecoveryError(error.message || 'No se pudo guardar la contraseña.')
      return
    }
    inPasswordRecovery.current = false
    setRecoveryUi(false)
    setNewPassword('')
    setConfirmPassword('')
    const { data: userData } = await supabase.auth.getUser()
    const em = (userData?.user?.email || '').trim().toLowerCase()
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
    }
    if (isMagariAdminEmail(em)) {
      setIsLoggedIn(true)
    } else {
      setLoginError('Contraseña actualizada. Inicia sesión con el email autorizado.')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream py-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-neutral-500" />
              </div>
              <h1 className="font-serif text-3xl text-neutral-700 mb-2">
                {recoveryUi ? 'Nueva contraseña' : 'Admin Login'}
              </h1>
              <p className="text-neutral-600 text-sm">
                {recoveryUi ? (
                  <>
                    Estás restableciendo el acceso. Elige una contraseña nueva (mín. 8 caracteres) y luego podrás usar el
                    panel.
                  </>
                ) : (
                  <>
                    Solo personal autorizado. Puedes entrar con <strong>contraseña</strong> (la que tengas en Supabase para
                    este email) o con <strong>Google</strong> si la cuenta está vinculada a {MAGARI_ADMIN_EMAIL}.
                  </>
                )}
              </p>
            </div>

            {recoveryUi ? (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                {recoveryError && (
                  <p className="text-red-700 text-sm bg-red-50 p-3 rounded-lg">{recoveryError}</p>
                )}
                <div>
                  <label className="block text-neutral-700 font-medium mb-2">Nueva contraseña *</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-2">Confirmar contraseña *</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <button type="submit" disabled={recoveryBusy} className="w-full btn-primary py-3 disabled:opacity-60">
                  {recoveryBusy ? 'Guardando…' : 'Guardar contraseña'}
                </button>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <p className="text-red-700 text-sm bg-red-50 p-3 rounded-lg whitespace-pre-line leading-relaxed">{loginError}</p>
              )}
              {loginInfo && (
                <p className="text-sage-dark text-sm bg-sage-muted/30 border border-sage-muted/50 p-3 rounded-lg whitespace-pre-line leading-relaxed">
                  {loginInfo}
                </p>
              )}
              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="magaribyelena@gmail.com"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                Sign In
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <span className="w-full border-t border-greige-light" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-neutral-500">o</span>
                </div>
              </div>

              <button
                type="button"
                disabled={oauthBusy}
                onClick={handleGoogleLogin}
                className="w-full btn-outline py-3 text-sm disabled:opacity-60"
              >
                {oauthBusy ? 'Abriendo Google…' : 'Continuar con Google'}
              </button>

              <button
                type="button"
                disabled={resetBusy}
                onClick={handleSendResetEmail}
                className="w-full text-sm text-sage-dark hover:underline disabled:opacity-60 py-1"
              >
                {resetBusy ? 'Enviando…' : '¿Olvidaste la contraseña? Enviar enlace de restablecimiento'}
              </button>
            </form>
            )}

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-neutral-700 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">
              Manage your store, vendors, and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 border border-neutral-200/80"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="font-medium text-neutral-700 hidden sm:inline">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-sage text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <AdminNotificationsDropdown
                  notifications={notifications}
                  error={notificationsError}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={() => markAllAsRead('admin', null)}
                  onClose={() => setShowNotifications(false)}
                  onNotificationClick={handleNotificationClick}
                />
              )}
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await supabase?.auth.signOut()
                } catch {
                  /* ignore */
                }
                setIsLoggedIn(false)
              }}
              className="btn-outline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: <TrendingUp className="w-4 h-4" />, label: 'Dashboard' },
            { id: 'products', icon: <Package className="w-4 h-4" />, label: 'Products' },
            { id: 'orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Orders' },
            { id: 'payouts', icon: <DollarSign className="w-4 h-4" />, label: 'Payouts' },
            { id: 'vendors', icon: <Users className="w-4 h-4" />, label: 'Vendors' },
            { id: 'listings', icon: <Building2 className="w-4 h-4" />, label: 'Listings' },
            { id: 'consultations', icon: <Calendar className="w-4 h-4" />, label: 'Consultations' },
            { id: 'availability', icon: <Clock className="w-4 h-4" />, label: 'Availability' },
            { id: 'services', icon: <Settings className="w-4 h-4" />, label: 'Services' },
            { id: 'reviews', icon: <MessageSquare className="w-4 h-4" />, label: 'Reviews' },
            { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sage text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'payouts' && <PayoutsView />}
        {activeTab === 'services' && <ServicesView />}
        {activeTab === 'vendors' && (
          <VendorsView
            highlightedApplicationId={highlightedApplicationId}
            onClearHighlight={() => setHighlightedApplicationId(null)}
          />
        )}
        {activeTab === 'listings' && <ListingsAdminView />}
        {activeTab === 'consultations' && <ConsultationsAdminView />}
        {activeTab === 'availability' && <AvailabilityAdminView />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  )
}

// Dashboard View – datos reales desde Supabase

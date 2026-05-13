import { Link, useLocation } from 'react-router-dom'
import { Calendar } from 'lucide-react'

export default function MobileBookNowBar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[60] md:hidden pointer-events-none px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-cream via-cream/95 to-transparent"
      aria-hidden={false}
    >
      <Link
        to="/contact#book"
        className="pointer-events-auto flex items-center justify-center gap-2 w-full rounded-2xl bg-sage text-white font-semibold text-[15px] tracking-wide py-3.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.25)] active:scale-[0.99] transition-transform"
      >
        <Calendar className="w-5 h-5 shrink-0" aria-hidden />
        Book Now
      </Link>
    </div>
  )
}

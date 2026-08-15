import { NavLink, useLocation } from 'react-router-dom'
import { Wallet, Repeat, Inbox, CalendarDays } from 'lucide-react'

// `tambien` = otras rutas que deben dejar la pestaña marcada como activa.
const tabs = [
  { to: '/finanzas', label: 'Dinero', Icon: Wallet, tambien: ['/historial'] },
  { to: '/habitos', label: 'Hábitos', Icon: Repeat },
  { to: '/pendientes', label: 'Pendientes', Icon: Inbox },
  { to: '/agenda', label: 'Agenda', Icon: CalendarDays },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ to, label, Icon, tambien = [] }) => {
          const activo = pathname === to || tambien.includes(pathname)
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  activo ? 'text-brand' : 'text-muted'
                }`}
              >
                <Icon size={22} strokeWidth={activo ? 2.4 : 1.8} />
                <span className={activo ? 'font-semibold' : ''}>{label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/layout.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Layout del módulo Operaciones — barra de navegación inferior mobile-first
 */
import Link from 'next/link'
import { Home, Package, Flame, Truck, Archive, Users } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/operaciones', label: 'Inicio',     Icon: Home },
  { href: '/operaciones/recepcion', label: 'Recepción',  Icon: Package },
  { href: '/operaciones/produccion', label: 'Producción', Icon: Flame },
  { href: '/operaciones/despacho',   label: 'Despacho',   Icon: Truck },
  { href: '/operaciones/inventario', label: 'Stock',      Icon: Archive },
  { href: '/operaciones/presentismo', label: 'Personal',  Icon: Users },
]

function NavBar() {
  // Server Component — no hooks available; cliente maneja el estado activo con CSS
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg
                       text-muted-foreground hover:text-foreground hover:bg-muted
                       transition-colors min-w-[48px]"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default function OperacionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <NavBar />
    </div>
  )
}

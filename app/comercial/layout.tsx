/**
 * @system     FlowAluminio
 * @module     app/comercial/layout.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Layout del módulo Comercial — barra de navegación inferior mobile-first
 */
'use client'

import { Home, Scale, Truck, ArrowDownLeft, RefreshCcw, TrendingUp } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'

const NAV_ITEMS = [
  { href: '/dashboard/comercial',      label: 'Inicio',    Icon: Home },
  { href: '/comercial/saldos',         label: 'Saldos',    Icon: Scale },
  { href: '/comercial/despachos',      label: 'Despachos', Icon: Truck },
  { href: '/comercial/pagos',          label: 'Pagos',     Icon: ArrowDownLeft },
  { href: '/comercial/conciliaciones', label: 'Conciliar', Icon: RefreshCcw },
  { href: '/comercial/margenes',       label: 'Márgenes',  Icon: TrendingUp },
]

export default function ComercialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <NavBar items={NAV_ITEMS} />
    </div>
  )
}

/**
 * @system     FlowAluminio
 * @module     app/operaciones/layout.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Layout del módulo Operaciones — barra de navegación inferior mobile-first
 */
'use client'

import { Home, Package, Flame, Truck, Archive, Users } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'

const NAV_ITEMS = [
  { href: '/dashboard/operaciones',   label: 'Inicio',     Icon: Home },
  { href: '/operaciones/recepcion',   label: 'Recepción',  Icon: Package },
  { href: '/operaciones/produccion',  label: 'Producción', Icon: Flame },
  { href: '/operaciones/despacho',    label: 'Despacho',   Icon: Truck },
  { href: '/operaciones/inventario',  label: 'Stock',      Icon: Archive },
  { href: '/operaciones/presentismo', label: 'Personal',   Icon: Users },
]

export default function OperacionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <NavBar items={NAV_ITEMS} />
    </div>
  )
}

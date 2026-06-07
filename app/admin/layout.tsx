/**
 * @system     FlowAluminio
 * @module     app/admin/layout.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Layout del módulo Administración — barra de navegación inferior mobile-first
 */
'use client'

import { Home, Receipt, DollarSign, Wallet, Users, LockKeyhole } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'

const NAV_ITEMS = [
  { href: '/dashboard/administracion', label: 'Inicio',   Icon: Home },
  { href: '/admin/gastos',             label: 'Gastos',   Icon: Receipt },
  { href: '/admin/cobros',             label: 'Cobros',   Icon: DollarSign },
  { href: '/admin/caja',               label: 'Caja',     Icon: Wallet },
  { href: '/admin/liquidaciones',      label: 'Liquidar', Icon: Users },
  { href: '/admin/cierres',            label: 'Cierres',  Icon: LockKeyhole },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <NavBar items={NAV_ITEMS} />
    </div>
  )
}

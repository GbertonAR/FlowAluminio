/**
 * @system     FlowAluminio
 * @module     app/superadmin/layout.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Layout del módulo Superadmin — acceso restringido a rol superadmin
 */
'use client'

import { Home, ScrollText, Users, Settings } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'

const NAV_ITEMS = [
  { href: '/dashboard/superadmin',  label: 'Inicio',    Icon: Home },
  { href: '/superadmin/auditoria',  label: 'Auditoría', Icon: ScrollText },
  { href: '/superadmin/usuarios',   label: 'Usuarios',  Icon: Users },
  { href: '/superadmin/parametros', label: 'Config',    Icon: Settings },
]

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <NavBar items={NAV_ITEMS} />
    </div>
  )
}

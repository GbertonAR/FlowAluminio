/**
 * @system     FlowAluminio
 * @module     components/logout-button.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Botón de cierre de sesión — client component reutilizable
 */
'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/app/(auth)/login/actions'

export function LogoutButton() {
  const [pending, start] = useTransition()

  return (
    <button
      onClick={() => start(() => logoutAction())}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                 disabled:opacity-50 transition-colors px-2 py-1 rounded-md hover:bg-muted"
      aria-label="Cerrar sesión"
    >
      <LogOut className="h-3.5 w-3.5" />
      {pending ? 'Saliendo…' : 'Salir'}
    </button>
  )
}

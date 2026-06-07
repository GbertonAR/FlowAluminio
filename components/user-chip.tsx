/**
 * @system     FlowAluminio
 * @module     components/user-chip.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Chip de identidad del usuario — server component, muestra nombre + rol + logout
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'

const ROL_LABEL: Record<string, string> = {
  operaciones:    'Operaciones',
  comercial:      'Comercial',
  administracion: 'Administración',
  superadmin:     'Superadmin',
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export async function UserChip() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <LogoutButton />

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  const nombre = perfil?.nombre ?? user.email ?? '?'

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/perfil"
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors"
      >
        <div className="flex flex-col items-end leading-none">
          <span className="text-xs font-medium">{nombre}</span>
          <span className="text-[10px] text-muted-foreground">
            {ROL_LABEL[perfil?.rol ?? ''] ?? perfil?.rol ?? ''}
          </span>
        </div>
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
          {iniciales(nombre)}
        </div>
      </Link>
      <LogoutButton />
    </div>
  )
}

/**
 * @system     FlowAluminio
 * @module     components/superadmin/invitar-usuario-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario de invitación de usuario — envía email de activación
 */
'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { invitarUsuario } from '@/app/(superadmin)/usuarios/actions'
import type { ActionResult } from '@/types'

type Planta = { id: string; nombre: string }

type Estado = ActionResult | null

async function invitarAction(_prev: Estado, formData: FormData): Promise<Estado> {
  const email    = (formData.get('email') as string).trim()
  const nombre   = (formData.get('nombre') as string).trim()
  const rol      = formData.get('rol') as string
  const plantaId = formData.get('planta_id') as string

  if (!email || !nombre || !rol) return { success: false, error: 'Completá todos los campos obligatorios' }

  return invitarUsuario(email, nombre, rol, plantaId || undefined)
}

const ROLES = [
  { value: 'operaciones',    label: 'Operaciones' },
  { value: 'comercial',      label: 'Comercial / Dueño' },
  { value: 'administracion', label: 'Administración' },
  { value: 'superadmin',     label: 'Superadministrador' },
]

interface Props {
  plantas: Planta[]
}

export function InvitarUsuarioForm({ plantas }: Props) {
  const [state, action, pending] = useActionState(invitarAction, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/superadmin/usuarios')
    }
  }, [state, router])

  return (
    <form action={action} className="space-y-4">

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Juan García"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="usuario@empresa.com"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="rol">Rol</label>
        <select
          id="rol"
          name="rol"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          defaultValue="operaciones"
          required
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {plantas.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="planta_id">
            Planta <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <select
            id="planta_id"
            name="planta_id"
            className="w-full h-12 rounded-md border bg-background px-3 text-sm"
            defaultValue=""
          >
            <option value="">Sin planta asignada</option>
            {plantas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <p className="text-xs text-muted-foreground px-1">
        El usuario recibirá un email con un enlace para establecer su contraseña.
      </p>

      {state && !state.success && state.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
        {pending ? 'Enviando invitación...' : 'Enviar invitación'}
      </Button>
    </form>
  )
}

/**
 * @system     FlowAluminio
 * @module     components/superadmin/usuario-actions.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Controles inline para cambiar rol y activar/desactivar un usuario
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { actualizarUsuario } from '@/app/(superadmin)/usuarios/actions'

const ROLES = ['operaciones', 'comercial', 'administracion', 'superadmin']

interface Props {
  usuarioId:  string
  rolActual:  string
  activo:     boolean
}

export function UsuarioActions({ usuarioId, rolActual, activo }: Props) {
  const [modo, setModo]     = useState<'idle' | 'editar'>('idle')
  const [rol, setRol]       = useState(rolActual)
  const [pending, start]    = useTransition()

  function guardar() {
    start(async () => {
      const result = await actualizarUsuario(usuarioId, { rol })
      if (result.success) {
        toast.success('Rol actualizado')
        setModo('idle')
      } else {
        toast.error(result.error ?? 'Error al actualizar')
      }
    })
  }

  function toggleActivo() {
    start(async () => {
      const result = await actualizarUsuario(usuarioId, { activo: !activo })
      if (result.success) {
        toast.success(activo ? 'Usuario desactivado' : 'Usuario reactivado')
      } else {
        toast.error(result.error ?? 'Error')
      }
    })
  }

  if (modo === 'editar') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <Button size="sm" className="h-8 text-xs shrink-0" disabled={pending} onClick={guardar}>
          {pending ? '...' : 'Guardar'}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0" onClick={() => setModo('idle')}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground"
        onClick={() => setModo('editar')}
      >
        Cambiar rol
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 text-xs ${activo ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-green-600'}`}
        disabled={pending}
        onClick={toggleActivo}
      >
        {activo ? 'Desactivar' : 'Reactivar'}
      </Button>
    </div>
  )
}

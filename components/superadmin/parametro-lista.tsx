/**
 * @system     FlowAluminio
 * @module     components/superadmin/parametro-lista.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Lista editable de parámetros (plantas, categorías, tipos) con toggle activo/inactivo
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/types'

interface Item {
  id:     string
  nombre: string
  activo: boolean
}

interface Props {
  items:       Item[]
  onCrear:     (nombre: string) => Promise<ActionResult>
  onToggle:    (id: string, activo: boolean) => Promise<ActionResult>
  placeholder: string
}

export function ParametroLista({ items, onCrear, onToggle, placeholder }: Props) {
  const [nuevo, setNuevo]         = useState('')
  const [pending, start]          = useTransition()

  const activos   = items.filter((i) => i.activo)
  const inactivos = items.filter((i) => !i.activo)

  function crear() {
    if (!nuevo.trim()) return
    start(async () => {
      const result = await onCrear(nuevo.trim())
      if (result.success) {
        toast.success('Creado')
        setNuevo('')
      } else {
        toast.error(result.error ?? 'Error')
      }
    })
  }

  function toggle(id: string, activo: boolean) {
    start(async () => {
      const result = await onToggle(id, !activo)
      if (!result.success) toast.error(result.error ?? 'Error')
    })
  }

  return (
    <div className="space-y-2">
      {/* Lista activos */}
      {activos.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2">
          <span className="text-sm">{item.nombre}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
            disabled={pending}
            onClick={() => toggle(item.id, item.activo)}
          >
            Desactivar
          </Button>
        </div>
      ))}

      {/* Lista inactivos */}
      {inactivos.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2 opacity-50">
          <span className="text-sm line-through text-muted-foreground">{item.nombre}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] text-muted-foreground hover:text-green-600"
            disabled={pending}
            onClick={() => toggle(item.id, item.activo)}
          >
            Activar
          </Button>
        </div>
      ))}

      {/* Añadir nuevo */}
      <div className="flex gap-2 pt-1">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') crear() }}
          placeholder={placeholder}
          className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-9 shrink-0"
          disabled={pending || !nuevo.trim()}
          onClick={crear}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

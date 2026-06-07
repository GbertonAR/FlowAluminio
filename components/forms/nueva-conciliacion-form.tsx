/**
 * @system     FlowAluminio
 * @module     components/forms/nueva-conciliacion-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario para crear conciliación — cliente + período
 */
'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { crearConciliacion } from '@/app/(comercial)/conciliaciones/actions'
import type { ActionResult } from '@/types'

type Cliente = { id: string; nombre: string }
type Estado = ActionResult<string> | null

async function nuevaConciliacionAction(_prev: Estado, formData: FormData): Promise<Estado> {
  const clienteId = formData.get('cliente_id') as string
  const desde     = formData.get('desde') as string
  const hasta     = formData.get('hasta') as string

  if (!clienteId || !desde || !hasta) return { success: false, error: 'Completá todos los campos' }
  if (hasta < desde) return { success: false, error: 'La fecha hasta debe ser mayor o igual a la fecha desde' }

  return crearConciliacion(clienteId, desde, hasta)
}

interface Props { clientes: Cliente[] }

export function NuevaConciliacionForm({ clientes }: Props) {
  const [state, action, pending] = useActionState(nuevaConciliacionAction, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/comercial/conciliaciones/${state.data}`)
    }
  }, [state, router])

  const hoy       = new Date().toISOString().split('T')[0]
  const mesInicio = hoy.slice(0, 7) + '-01'

  return (
    <form action={action} className="space-y-4">

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="cliente_id">Cliente</label>
        <select
          id="cliente_id"
          name="cliente_id"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          defaultValue=""
          required
        >
          <option value="" disabled>Seleccioná un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="desde">Desde</label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={mesInicio}
            className="w-full h-12 rounded-md border bg-background px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="hasta">Hasta</label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            defaultValue={hoy}
            className="w-full h-12 rounded-md border bg-background px-3 text-sm"
            required
          />
        </div>
      </div>

      {state && !state.success && state.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
        {pending ? 'Creando...' : 'Crear conciliación'}
      </Button>
    </form>
  )
}

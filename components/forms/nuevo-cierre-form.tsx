/**
 * @system     FlowAluminio
 * @module     components/forms/nuevo-cierre-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario de nuevo cierre de período — semanal o mensual
 */
'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { crearCierre } from '@/app/(admin)/cierres/actions'

import type { ActionResult } from '@/types'

type Estado = ActionResult<string> | null

async function nuevoCierreAction(_prev: Estado, formData: FormData): Promise<Estado> {
  const tipo        = formData.get('tipo') as 'semanal' | 'mensual'
  const desde       = formData.get('desde') as string
  const hasta       = formData.get('hasta') as string
  const observacion = formData.get('observacion') as string

  if (!tipo || !desde || !hasta) return { success: false, error: 'Completá todos los campos obligatorios' }
  if (hasta < desde) return { success: false, error: 'La fecha hasta debe ser mayor o igual a la fecha desde' }

  return crearCierre(tipo, desde, hasta, observacion || undefined)
}

export function NuevoCierreForm() {
  const [state, action, pending] = useActionState(nuevoCierreAction, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/cierres')
    }
  }, [state, router])

  const hoy = new Date().toISOString().split('T')[0]

  // Sugerir inicio de semana (lunes) y fin (domingo) para semanal
  const diaSemana = new Date().getDay() // 0=domingo
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1
  const lunesStr = new Date(Date.now() - diasHastaLunes * 86400000).toISOString().split('T')[0]
  const domingoStr = new Date(Date.now() + (6 - diasHastaLunes) * 86400000).toISOString().split('T')[0]

  // Inicio y fin del mes actual
  const mesInicio = hoy.slice(0, 7) + '-01'
  const mesFin = new Date(new Date(hoy).getFullYear(), new Date(hoy).getMonth() + 1, 0).toISOString().split('T')[0]

  return (
    <form action={action} className="space-y-4">

      <div className="space-y-1">
        <label className="text-sm font-medium">Tipo de cierre</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="tipo" value="semanal" className="sr-only" defaultChecked />
            <div>
              <p className="text-sm font-medium">Semanal</p>
              <p className="text-xs text-muted-foreground">7 días</p>
            </div>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="tipo" value="mensual" className="sr-only" />
            <div>
              <p className="text-sm font-medium">Mensual</p>
              <p className="text-xs text-muted-foreground">Mes completo</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="desde">Desde</label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={lunesStr}
            className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="hasta">Hasta</label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            defaultValue={domingoStr}
            className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground px-1">
        Sugerencia semanal: {lunesStr} – {domingoStr} · Mensual: {mesInicio} – {mesFin}
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="observacion">Observación (opcional)</label>
        <textarea
          id="observacion"
          name="observacion"
          rows={2}
          placeholder="Ej: Cierre semana del 2/6 al 8/6"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      {state && !state.success && state.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
        {pending ? 'Cerrando período...' : 'Cerrar período'}
      </Button>
    </form>
  )
}

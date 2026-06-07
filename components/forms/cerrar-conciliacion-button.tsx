/**
 * @system     FlowAluminio
 * @module     components/forms/cerrar-conciliacion-button.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Botón de cierre de conciliación con observación opcional
 */
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/types'

interface Props {
  conciliacionId: string
  onCerrar: (observacion?: string) => Promise<ActionResult>
}

export function CerrarConciliacionButton({ onCerrar }: Props) {
  const [modo, setModo]         = useState<'idle' | 'confirmar'>('idle')
  const [obs, setObs]           = useState('')
  const [pending, start]        = useTransition()
  const router                  = useRouter()

  function cerrar() {
    start(async () => {
      const result = await onCerrar(obs.trim() || undefined)
      if (result.success) {
        toast.success('Conciliación cerrada')
        router.push('/comercial/conciliaciones')
      } else {
        toast.error(result.error ?? 'Error al cerrar')
      }
    })
  }

  if (modo === 'idle') {
    return (
      <Button
        className="w-full h-14 text-base font-semibold"
        onClick={() => setModo('confirmar')}
      >
        Cerrar conciliación
      </Button>
    )
  }

  return (
    <div className="space-y-3 border rounded-lg p-4">
      <p className="text-sm font-medium">Confirmar cierre</p>
      <p className="text-xs text-muted-foreground">
        Una vez cerrada, la conciliación no puede modificarse.
      </p>
      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Observación (opcional)"
        rows={2}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
      />
      <div className="flex gap-2">
        <Button className="flex-1 h-12" disabled={pending} onClick={cerrar}>
          {pending ? 'Cerrando...' : 'Confirmar cierre'}
        </Button>
        <Button variant="outline" className="h-12" onClick={() => setModo('idle')}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

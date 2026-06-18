/**
 * @system     FlowAluminio
 * @module     components/forms/comprobante-btns.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Botones de acción documental para comprobante — validar / observar (PRD §4.3)
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  id: string
  onValidar: (id: string) => Promise<{ success: boolean; error?: string }>
  onObservar: (id: string, obs: string) => Promise<{ success: boolean; error?: string }>
}

export function ComprobanteBtns({ id, onValidar, onObservar }: Props) {
  const [estado, setEstado] = useState<'idle' | 'observando'>('idle')
  const [obs, setObs]       = useState('')
  const [pending, start]    = useTransition()

  function handleValidar() {
    start(async () => {
      const r = await onValidar(id)
      if (r.success) toast.success('Comprobante validado')
      else toast.error(r.error ?? 'Error')
    })
  }

  function handleObservar() {
    if (!obs.trim()) { toast.error('Ingresá una observación'); return }
    start(async () => {
      const r = await onObservar(id, obs)
      if (r.success) {
        toast.success('Observación registrada')
        setEstado('idle')
        setObs('')
      } else {
        toast.error(r.error ?? 'Error')
      }
    })
  }

  if (estado === 'idle') {
    return (
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/40"
          onClick={handleValidar}
          disabled={pending}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Validar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900/40"
          onClick={() => setEstado('observando')}
          disabled={pending}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Observar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-amber-600">Observación</p>
        <button onClick={() => { setEstado('idle'); setObs('') }} className="text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Textarea
        placeholder="Describí el problema o la observación..."
        className="min-h-[60px] text-sm"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
      />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEstado('idle'); setObs('') }} disabled={pending}>
          Cancelar
        </Button>
        <Button size="sm" className="flex-1" onClick={handleObservar} disabled={pending}>
          {pending ? 'Guardando...' : 'Confirmar'}
        </Button>
      </div>
    </div>
  )
}

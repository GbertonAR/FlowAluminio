/**
 * @system     FlowAluminio
 * @module     components/anular-button.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Botón de anulación con confirmación inline — requiere motivo obligatorio
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ActionResult } from '@/types'

interface AnularButtonProps {
  onAnular: (motivo: string) => Promise<ActionResult>
  label?: string
}

export function AnularButton({ onAnular, label = 'Anular' }: AnularButtonProps) {
  const [modo, setModo]   = useState<'idle' | 'confirmar'>('idle')
  const [motivo, setMotivo] = useState('')
  const [pending, startTransition] = useTransition()

  function confirmar() {
    if (!motivo.trim()) { toast.error('Ingresá un motivo'); return }
    startTransition(async () => {
      const result = await onAnular(motivo.trim())
      if (result.success) {
        toast.success('Registro anulado')
        setModo('idle')
        setMotivo('')
      } else {
        toast.error(result.error ?? 'Error al anular')
      }
    })
  }

  if (modo === 'idle') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-destructive"
        onClick={() => setModo('confirmar')}
      >
        {label}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <Input
        placeholder="Motivo de anulación"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="h-8 text-xs"
        autoFocus
      />
      <Button
        size="sm"
        variant="destructive"
        className="h-8 text-xs shrink-0"
        disabled={pending}
        onClick={confirmar}
      >
        {pending ? '...' : 'Confirmar'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-xs shrink-0"
        onClick={() => { setModo('idle'); setMotivo('') }}
      >
        Cancelar
      </Button>
    </div>
  )
}

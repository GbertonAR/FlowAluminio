/**
 * @system     FlowAluminio
 * @module     components/superadmin/parametro-inline-editor.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Editor inline para un parámetro de texto simple
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/types'

interface Props {
  label:     string
  valor:     string
  onGuardar: (valor: string) => Promise<ActionResult>
}

export function ParametroInlineEditor({ label, valor, onGuardar }: Props) {
  const [editando, setEditando]  = useState(false)
  const [texto, setTexto]        = useState(valor)
  const [pending, start]         = useTransition()

  function guardar() {
    if (!texto.trim()) { toast.error('El campo no puede estar vacío'); return }
    start(async () => {
      const result = await onGuardar(texto.trim())
      if (result.success) {
        toast.success('Guardado')
        setEditando(false)
      } else {
        toast.error(result.error ?? 'Error')
      }
    })
  }

  if (!editando) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{valor || '—'}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setEditando(true)}
        >
          Editar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="flex-1 h-10 rounded-md border bg-background px-3 text-sm"
          autoFocus
        />
        <Button size="sm" className="h-10 shrink-0" disabled={pending} onClick={guardar}>
          {pending ? '...' : 'Guardar'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-10 shrink-0"
          onClick={() => { setTexto(valor); setEditando(false) }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}

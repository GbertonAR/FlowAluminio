/**
 * @system     FlowAluminio
 * @module     components/forms/ajuste-conciliacion-button.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Botón para registrar ajuste en conciliación sin modificar histórico (PRD §8.14)
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PlusCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { ActionResult } from '@/types'

interface Props {
  onAjuste: (tipo: 'fisico' | 'comercial', kgAjuste: number, motivo: string) => Promise<ActionResult>
}

export function AjusteConciliacionButton({ onAjuste }: Props) {
  const [estado, setEstado] = useState<'idle' | 'form'>('idle')
  const [tipo, setTipo]     = useState<'fisico' | 'comercial'>('fisico')
  const [kg, setKg]         = useState('')
  const [motivo, setMotivo] = useState('')
  const [pending, start]    = useTransition()

  function handleCancel() {
    setEstado('idle')
    setTipo('fisico')
    setKg('')
    setMotivo('')
  }

  function handleConfirm() {
    const kgNum = parseFloat(kg)
    if (isNaN(kgNum) || kgNum === 0) {
      toast.error('Ingresá un valor de kg (puede ser negativo)')
      return
    }
    if (!motivo.trim()) {
      toast.error('El motivo del ajuste es obligatorio')
      return
    }

    start(async () => {
      const result = await onAjuste(tipo, kgNum, motivo)
      if (result.success) {
        toast.success('Ajuste registrado')
        handleCancel()
      } else {
        toast.error(result.error ?? 'Error al registrar ajuste')
      }
    })
  }

  if (estado === 'idle') {
    return (
      <Button
        variant="outline"
        className="w-full h-11 gap-2 border-dashed"
        onClick={() => setEstado('form')}
      >
        <PlusCircle className="h-4 w-4" />
        Registrar ajuste
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Nuevo ajuste</p>
        <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Select value={tipo} onValueChange={(v) => setTipo(v as 'fisico' | 'comercial')}>
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fisico">Ajuste físico (kg inventario)</SelectItem>
          <SelectItem value="comercial">Ajuste comercial (kg reconocidos)</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="ej: -50 o +120"
          step="0.01"
          className="h-11 text-base text-right pr-3 pl-10"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
        />
      </div>

      <Textarea
        placeholder="Motivo del ajuste (obligatorio)..."
        className="min-h-[72px] text-sm"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleConfirm}
          disabled={pending}
        >
          {pending ? 'Guardando...' : 'Confirmar ajuste'}
        </Button>
      </div>
    </div>
  )
}

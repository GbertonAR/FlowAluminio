/**
 * @system     FlowAluminio
 * @module     components/superadmin/maestro-abm.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Componente genérico de ABM inline para tablas maestras — Alta, Baja, Modificación
 */
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ActionResult } from '@/types'

export type FieldDef = {
  key:         string
  label:       string
  type:        'text' | 'date' | 'select' | 'number'
  options?:    { value: string; label: string }[]
  required?:   boolean
  placeholder?: string
}

export interface ItemABM {
  id:     string
  activo: boolean | null
  [key: string]: unknown
}

interface Props {
  items:        ItemABM[]
  campos:       FieldDef[]
  getNombre:    (item: ItemABM) => string
  getSubtitulo?: (item: ItemABM) => string | undefined
  onCrear:      (values: Record<string, string>) => Promise<ActionResult>
  onActualizar?: (id: string, values: Record<string, string>) => Promise<ActionResult>
  onToggle:     (id: string, activo: boolean) => Promise<ActionResult>
  labelNuevo:   string
}

export function MaestroABM({
  items, campos, getNombre, getSubtitulo,
  onCrear, onActualizar, onToggle, labelNuevo,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm]            = useState<Record<string, string>>({})
  const [pending, start]           = useTransition()

  const activos   = items.filter((i) => i.activo !== false)
  const inactivos = items.filter((i) => i.activo === false)

  function buildInitialForm(item?: ItemABM): Record<string, string> {
    const vals: Record<string, string> = {}
    campos.forEach((f) => {
      if (item) {
        vals[f.key] = item[f.key] != null ? String(item[f.key]) : ''
      } else {
        if (f.type === 'date')   vals[f.key] = new Date().toISOString().slice(0, 10)
        else if (f.type === 'select') vals[f.key] = f.options?.[0]?.value ?? ''
        else vals[f.key] = ''
      }
    })
    return vals
  }

  function startEdit(item: ItemABM) {
    setForm(buildInitialForm(item))
    setEditingId(item.id)
    setIsCreating(false)
  }

  function startCreate() {
    setForm(buildInitialForm())
    setIsCreating(true)
    setEditingId(null)
  }

  function cancel() {
    setEditingId(null)
    setIsCreating(false)
    setForm({})
  }

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isValid = campos.filter((f) => f.required).every((f) => form[f.key]?.trim())

  function guardar(id?: string) {
    if (!isValid) { toast.error('Completá los campos requeridos'); return }
    start(async () => {
      const result = id && onActualizar
        ? await onActualizar(id, form)
        : await onCrear(form)
      if (result.success) {
        toast.success(id ? 'Actualizado' : 'Creado')
        cancel()
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    })
  }

  function toggle(id: string, activo: boolean | null) {
    start(async () => {
      const result = await onToggle(id, !(activo ?? true))
      if (!result.success) toast.error(result.error ?? 'Error')
    })
  }

  function renderFields() {
    return (
      <div className="space-y-2 pt-2">
        {campos.map((f) => (
          <div key={f.key}>
            <label className="text-[11px] text-muted-foreground block mb-0.5">
              {f.label}{f.required && ' *'}
            </label>
            {f.type === 'select' ? (
              <select
                value={form[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : f.type}
                value={form[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                step={f.type === 'number' ? '0.01' : undefined}
                min={f.type === 'number' ? '0' : undefined}
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              />
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-9"
            disabled={pending || !isValid}
            onClick={() => guardar(editingId ?? undefined)}
          >
            {pending ? '...' : 'Guardar'}
          </Button>
          <Button size="sm" variant="ghost" className="h-9 shrink-0" disabled={pending} onClick={cancel}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  function renderItem(item: ItemABM) {
    const isEditing = editingId === item.id
    const isActive  = item.activo !== false
    const subtitulo = getSubtitulo?.(item)

    return (
      <Card key={item.id} className={!isActive ? 'opacity-60' : ''}>
        <CardContent className="py-2 px-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium leading-snug ${!isActive ? 'line-through text-muted-foreground' : ''}`}>
                {getNombre(item)}
              </p>
              {subtitulo && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{subtitulo}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0 mt-0.5">
              {onActualizar && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground"
                  disabled={pending}
                  onClick={() => isEditing ? cancel() : startEdit(item)}
                >
                  {isEditing
                    ? <ChevronUp className="h-3.5 w-3.5" />
                    : <Pencil className="h-3.5 w-3.5" />
                  }
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 text-[11px] px-2 text-muted-foreground ${isActive ? 'hover:text-destructive' : 'hover:text-green-600'}`}
                disabled={pending}
                onClick={() => toggle(item.id, item.activo)}
              >
                {isActive ? 'Baja' : 'Alta'}
              </Button>
            </div>
          </div>
          {isEditing && renderFields()}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {!isCreating && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 border-dashed"
          onClick={startCreate}
        >
          <Plus className="h-4 w-4 mr-1" />
          {labelNuevo}
        </Button>
      )}

      {isCreating && (
        <Card className="border-primary/50">
          <CardContent className="py-2 px-3">
            <p className="text-xs font-semibold text-primary mb-0.5">{labelNuevo}</p>
            {renderFields()}
          </CardContent>
        </Card>
      )}

      {activos.map(renderItem)}

      {inactivos.length > 0 && (
        <>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide px-1 pt-2">
            Inactivos ({inactivos.length})
          </p>
          {inactivos.map(renderItem)}
        </>
      )}
    </div>
  )
}

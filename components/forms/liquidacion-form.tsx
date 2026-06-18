/**
 * @system     FlowAluminio
 * @module     components/forms/liquidacion-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario de liquidación en dos pasos: selección + revisión de sugerencia calculada
 */
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { generarSugerenciaLiquidacion, confirmarLiquidacion } from '@/app/(admin)/liquidaciones/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Empleado { id: string; nombre: string }

interface Sugerencia {
  empleadoId: string
  periodoDesde: string
  periodoHasta: string
  modalidad: string
  valorAplicado: number
  diasHabiles: number
  diasPresentes: number
  diasAusentes: number
  horasExtra: number
  kgProducidosDiasPresentes: number
  kgSugeridosLiquidar: number
  valorPorKg: number | null
  viaticos: number
  premioSugerido: boolean
  montoPremio: number
  totalSugerido: number
}

interface LiquidacionFormProps {
  empleados: Empleado[]
}

export function LiquidacionForm({ empleados }: LiquidacionFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [empleadoId, setEmpleadoId] = useState('')
  const [periodoDesde, setPeriodoDesde] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [periodoHasta, setPeriodoHasta] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null)

  // Campos ajustables
  const [kgLiquidados, setKgLiquidados]         = useState(0)
  const [premioAprobado, setPremioAprobado]      = useState(false)
  const [montoPremio, setMontoPremio]            = useState(0)
  const [extras, setExtras]                      = useState(0)
  const [descuentos, setDescuentos]              = useState(0)
  const [adelantos, setAdelantos]                = useState(0)

  const totalPagado = sugerencia
    ? (sugerencia.modalidad === 'por_kilo'
        ? kgLiquidados * (sugerencia.valorPorKg ?? 0)
        : sugerencia.valorAplicado * (sugerencia.diasPresentes / Math.max(sugerencia.diasHabiles, 1))
      ) + sugerencia.viaticos + (premioAprobado ? montoPremio : 0) + extras - descuentos - adelantos
    : 0

  function calcular() {
    if (!empleadoId || !periodoDesde || !periodoHasta) {
      toast.error('Completá empleado y período')
      return
    }
    startTransition(async () => {
      const result = await generarSugerenciaLiquidacion(empleadoId, periodoDesde, periodoHasta)
      if (!result.success || !result.sugerencia) {
        toast.error(result.error ?? 'Error al calcular')
        return
      }
      const s = result.sugerencia
      setSugerencia(s)
      setKgLiquidados(s.kgSugeridosLiquidar)
      setPremioAprobado(s.premioSugerido)
      setMontoPremio(s.montoPremio)
      setExtras(0)
      setDescuentos(0)
      setAdelantos(0)
    })
  }

  function confirmar() {
    if (!sugerencia) return
    startTransition(async () => {
      const result = await confirmarLiquidacion({
        empleadoId:                  sugerencia.empleadoId,
        periodoDesde:                sugerencia.periodoDesde,
        periodoHasta:                sugerencia.periodoHasta,
        modalidad:                   sugerencia.modalidad,
        valorAplicado:               sugerencia.valorAplicado,
        diasHabiles:                 sugerencia.diasHabiles,
        diasPresentes:               sugerencia.diasPresentes,
        diasAusentes:                sugerencia.diasAusentes,
        horasExtra:                  sugerencia.horasExtra,
        kgProducidosDiasPresentes:   sugerencia.kgProducidosDiasPresentes,
        kgLiquidados,
        valorPorKg:                  sugerencia.valorPorKg,
        viaticos:                    sugerencia.viaticos,
        extras,
        premioAprobado,
        montoPremio: premioAprobado ? montoPremio : 0,
        descuentos,
        adelantos,
        totalPagado,
      })
      if (result.success) {
        toast.success('Liquidación confirmada')
        router.push('/admin/liquidaciones')
      } else {
        toast.error(result.error ?? 'Error al confirmar')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Paso 1: Selección */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Paso 1 — Selección</p>

          <div className="space-y-1">
            <Label>Empleado</Label>
            <Select value={empleadoId || undefined} onValueChange={(v) => setEmpleadoId(v ?? '')}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Seleccioná el empleado">
                  {empleadoId ? empleados.find((e) => e.id === empleadoId)?.nombre : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {empleados.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Desde</Label>
              <Input type="date" value={periodoDesde} onChange={(e) => setPeriodoDesde(e.target.value)} className="h-12 text-base" />
            </div>
            <div className="space-y-1">
              <Label>Hasta</Label>
              <Input type="date" value={periodoHasta} onChange={(e) => setPeriodoHasta(e.target.value)} className="h-12 text-base" />
            </div>
          </div>

          <Button onClick={calcular} disabled={pending} className="w-full h-12">
            {pending ? 'Calculando...' : 'Calcular sugerencia'}
          </Button>
        </CardContent>
      </Card>

      {/* Paso 2: Revisión */}
      {sugerencia && (
        <Card>
          <CardContent className="py-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Paso 2 — Revisión</p>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Días pres.</p>
                <p className="font-bold text-green-600">{sugerencia.diasPresentes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ausentes</p>
                <p className="font-bold text-destructive">{sugerencia.diasAusentes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kg prod.</p>
                <p className="font-bold">{sugerencia.kgProducidosDiasPresentes.toFixed(0)}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Modalidad: <strong>{sugerencia.modalidad}</strong> ·
              Valor: <strong>${sugerencia.valorAplicado.toLocaleString('es-AR')}</strong>
            </p>

            {sugerencia.modalidad === 'por_kilo' && (
              <div className="space-y-1">
                <Label>Kg a liquidar (ajustable)</Label>
                <Input
                  type="number"
                  value={kgLiquidados}
                  onChange={(e) => setKgLiquidados(parseFloat(e.target.value) || 0)}
                  className="h-12 text-base text-right"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={premioAprobado}
                  onChange={(e) => setPremioAprobado(e.target.checked)}
                  className="h-4 w-4"
                />
                Premio presentismo
                {sugerencia.premioSugerido && <span className="text-xs text-green-600">(sugerido)</span>}
              </Label>
              {premioAprobado && (
                <Input
                  type="number"
                  value={montoPremio}
                  onChange={(e) => setMontoPremio(parseFloat(e.target.value) || 0)}
                  className="h-10 text-base text-right"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Extras',     val: extras,     set: setExtras },
                { label: 'Descuentos', val: descuentos, set: setDescuentos },
                { label: 'Adelantos',  val: adelantos,  set: setAdelantos },
              ].map(({ label, val, set }) => (
                <div key={label} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) => set(parseFloat(e.target.value) || 0)}
                    className="h-10 text-sm text-right"
                  />
                </div>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="py-3 flex items-center justify-between">
                <p className="font-medium">Total a pagar</p>
                <p className="text-2xl font-bold">
                  ${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>

            <Button onClick={confirmar} disabled={pending} className="w-full h-14 text-base font-semibold">
              {pending ? 'Confirmando...' : 'Confirmar liquidación'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

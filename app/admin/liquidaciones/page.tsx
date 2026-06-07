/**
 * @system     FlowAluminio
 * @module     app/admin/liquidaciones/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de liquidaciones de personal — mobile-first
 */
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorMes } from '@/components/selector-mes'
import { getLiquidaciones } from '@/app/(admin)/liquidaciones/actions'

const ESTADO_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  borrador:   'outline',
  confirmada: 'secondary',
  pagada:     'default',
}

interface Props { searchParams: Promise<{ mes?: string }> }

export default async function LiquidacionesPage({ searchParams }: Props) {
  const { mes: mesParam } = await searchParams
  const hoy = new Date()
  const mes = mesParam ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

  const liquidaciones = await getLiquidaciones(mes)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Liquidaciones</h1>
          <Button render={<Link href="/admin/liquidaciones/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
        <SelectorMes mes={mes} />
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {liquidaciones.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin liquidaciones generadas</p>
            <Button render={<Link href="/admin/liquidaciones/nueva" />} variant="outline" className="mt-4">
              Generar primera liquidación
            </Button>
          </div>
        ) : (
          liquidaciones.map((l) => (
            <Card key={l.id}>
              <CardContent className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {(l.empleados as unknown as { nombre: string } | null)?.nombre ?? '—'}
                  </p>
                  <Badge variant={ESTADO_VARIANT[l.estado] ?? 'outline'}>{l.estado}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {l.periodo_desde} → {l.periodo_hasta} · {l.modalidad}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {l.dias_presentes}/{l.dias_habiles} días
                    {l.premio_aprobado ? ' · Premio ✓' : ''}
                  </span>
                  <span className="font-bold">
                    ${(l.total_pagado != null ? l.total_pagado : l.total_sugerido as number).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}

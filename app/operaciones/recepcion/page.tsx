/**
 * @system     FlowAluminio
 * @module     app/operaciones/recepcion/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de recepciones del día — mobile-first
 */
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorFecha } from '@/components/selector-fecha'
import { EmptyState } from '@/components/empty-state'
import { getRecepciones, anularRecepcion } from '@/app/(operaciones)/recepcion/actions'
import { AnularButton } from '@/components/anular-button'

interface Props { searchParams: Promise<{ fecha?: string }> }

export default async function RecepcionListPage({ searchParams }: Props) {
  const hoy    = new Date().toISOString().split('T')[0]
  const params = await searchParams
  const fecha  = params.fecha ?? hoy
  const recepciones = await getRecepciones(fecha)

  const totalKgFisicos = recepciones.reduce((s, r) => s + (r.kg_fisicos ?? 0), 0)
  const totalKgReconocidos = recepciones.reduce((s, r) => s + (r.kg_reconocidos ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Recepción</h1>
          <Button render={<Link href="/operaciones/recepcion/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
        <SelectorFecha fecha={fecha} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Kg físicos hoy</p>
              <p className="text-2xl font-bold">{totalKgFisicos.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Kg reconocidos</p>
              <p className="text-2xl font-bold">{totalKgReconocidos.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>

        {recepciones.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sin recepciones"
            message="No hay recepciones de chatarra registradas para este día"
            action={
              <Button render={<Link href="/operaciones/recepcion/nueva" />} variant="outline">
                Registrar recepción
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recepciones.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{(r.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}</p>
                      <p className="text-sm text-muted-foreground">
                        {(r.tipos_chatarra as unknown as { nombre: string } | null)?.nombre} ·{' '}
                        {(r.calidades_chatarra as unknown as { nombre: string } | null)?.nombre}
                      </p>
                    </div>
                    <Badge variant={r.estado === 'confirmado' ? 'secondary' : 'outline'}>
                      {r.estado}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Físicos: <strong>{r.kg_fisicos?.toFixed(1)} kg</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Merma: <strong>{((r.merma_pct ?? 0) * 100).toFixed(1)}%</strong>
                    </span>
                    <span>
                      Reconocidos: <strong>{r.kg_reconocidos?.toFixed(1)} kg</strong>
                    </span>
                  </div>
                  {r.remito && (
                    <p className="text-xs text-muted-foreground">Remito: {r.remito}</p>
                  )}
                  <AnularButton onAnular={anularRecepcion.bind(null, r.id)} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

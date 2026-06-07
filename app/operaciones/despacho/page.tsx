/**
 * @system     FlowAluminio
 * @module     app/operaciones/despacho/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de despachos del día — mobile-first
 */
import Link from 'next/link'
import { Plus, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorFecha } from '@/components/selector-fecha'
import { EmptyState } from '@/components/empty-state'
import { getDespachosDelDia, anularDespacho } from '@/app/(operaciones)/despacho/actions'
import { AnularButton } from '@/components/anular-button'

interface Props { searchParams: Promise<{ fecha?: string }> }

export default async function DespachoListPage({ searchParams }: Props) {
  const hoy    = new Date().toISOString().split('T')[0]
  const params = await searchParams
  const fecha  = params.fecha ?? hoy
  const despachos = await getDespachosDelDia(fecha)

  const totalKg = despachos.reduce((s, d) => s + (d.kg_despachados ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Despacho</h1>
          <Button render={<Link href="/operaciones/despacho/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
        <SelectorFecha fecha={fecha} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Kg despachados hoy</p>
            <p className="text-3xl font-bold">{totalKg.toFixed(0)}</p>
          </CardContent>
        </Card>

        {despachos.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Sin despachos"
            message="No hay despachos registrados para este día"
            action={
              <Button render={<Link href="/operaciones/despacho/nueva" />} variant="outline">
                Registrar despacho
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {despachos.map((d) => (
              <Card key={d.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {(d.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                    </p>
                    <p className="font-bold text-lg">{d.kg_despachados?.toFixed(1)} kg</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {(d.productos as unknown as { nombre: string } | null)?.nombre && (
                      <span>{(d.productos as unknown as { nombre: string }).nombre}</span>
                    )}
                    {d.remito && <span>Remito: {d.remito}</span>}
                  </div>
                  <AnularButton onAnular={(motivo) => anularDespacho(d.id, motivo)} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

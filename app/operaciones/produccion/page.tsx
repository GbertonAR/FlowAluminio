/**
 * @system     FlowAluminio
 * @module     app/operaciones/produccion/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de coladas del día — mobile-first
 */
import Link from 'next/link'
import { Plus, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorFecha } from '@/components/selector-fecha'
import { EmptyState } from '@/components/empty-state'
import { getProduccionesDelDia, anularProduccion } from '@/app/(operaciones)/produccion/actions'
import { AnularButton } from '@/components/anular-button'

function pct(n: number | null | undefined) {
  if (n == null) return '—'
  return (n * 100).toFixed(1) + '%'
}

interface Props { searchParams: Promise<{ fecha?: string }> }

export default async function ProduccionListPage({ searchParams }: Props) {
  const hoy    = new Date().toISOString().split('T')[0]
  const params = await searchParams
  const fecha  = params.fecha ?? hoy
  const producciones = await getProduccionesDelDia(fecha)

  const totalTocho = producciones.reduce((s, p) => s + (p.kg_tocho ?? 0), 0)
  const totalEscoria = producciones.reduce((s, p) => s + (p.kg_escoria ?? 0), 0)
  const totalVolatilizado = producciones.reduce((s, p) => s + (p.kg_volatilizado ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Producción</h1>
          <Button render={<Link href="/operaciones/produccion/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
        <SelectorFecha fecha={fecha} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Tocho</p>
              <p className="text-xl font-bold">{totalTocho.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Escoria</p>
              <p className="text-xl font-bold">{totalEscoria.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Volatiliz.</p>
              <p className="text-xl font-bold">{totalVolatilizado.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </CardContent>
          </Card>
        </div>

        {producciones.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Sin coladas"
            message="No hay coladas registradas para este día"
            action={
              <Button render={<Link href="/operaciones/produccion/nueva" />} variant="outline">
                Registrar colada
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {producciones.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        Colada {p.numero_colada} —{' '}
                        {(p.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {pct(p.rendimiento_pct)} rend.
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Tocho</p>
                      <p className="font-medium">{p.kg_tocho?.toFixed(0)} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Escoria</p>
                      <p className="font-medium">{p.kg_escoria?.toFixed(0)} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Volatil.</p>
                      <p className="font-medium">{p.kg_volatilizado?.toFixed(0)} kg</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Merma: <strong>{pct(p.merma_productiva_pct)}</strong></span>
                    <span>Mix 1ª: <strong>{pct(p.mix_1ra_pct)}</strong></span>
                    <span>Mix 2ª: <strong>{pct(p.mix_2da_pct)}</strong></span>
                  </div>
                  <AnularButton onAnular={(motivo) => anularProduccion(p.id, motivo)} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

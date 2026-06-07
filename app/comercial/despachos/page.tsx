/**
 * @system     FlowAluminio
 * @module     app/comercial/despachos/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Despachos del mes con estado de valorización — acceso a valorizar
 */
import Link from 'next/link'
import { Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { getDespachosPendientes } from '@/app/(comercial)/valorizacion/actions'

export default async function DespachosComercialesPage() {
  const mes = new Date().toISOString().slice(0, 7)
  const despachos = await getDespachosPendientes(mes)

  const valorizar = despachos.filter((d) => !d.valorizado)
  const valorizados = despachos.filter((d) => d.valorizado)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Despachos — {mes}</h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {despachos.length === 0 && (
          <EmptyState icon={Truck} title="Sin despachos" message="No hay despachos registrados este mes" />
        )}

        {valorizar.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Pendientes de valorizar ({valorizar.length})
            </p>
            {valorizar.map((d) => (
              <Card key={d.id} className="border-orange-200">
                <CardContent className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {(d.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {d.fecha} · {d.kg_despachados?.toFixed(1)} kg
                      {d.remito ? ` · ${d.remito}` : ''}
                    </p>
                  </div>
                  <Button
                    render={<Link href={`/comercial/despachos/${d.id}/valorizar`} />}
                    size="sm" className="h-8 text-xs shrink-0"
                  >
                    Valorizar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {valorizados.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Valorizados ({valorizados.length})
            </p>
            {valorizados.map((d) => (
              <Card key={d.id}>
                <CardContent className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {(d.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {d.fecha} · {d.kg_despachados?.toFixed(1)} kg
                    </p>
                  </div>
                  <Badge variant="secondary">Valorizado</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

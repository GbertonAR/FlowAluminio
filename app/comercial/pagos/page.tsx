/**
 * @system     FlowAluminio
 * @module     app/comercial/pagos/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Listado de pagos de chatarra del mes — Comercial (PRD §8.19)
 */
import Link from 'next/link'
import { Plus, ArrowDownLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorMes } from '@/components/selector-mes'
import { EmptyState } from '@/components/empty-state'
import { AnularButton } from '@/components/anular-button'
import { getPagos, anularPago } from '@/app/(comercial)/pagos/actions'

interface Props { searchParams: Promise<{ mes?: string }> }

function fmtPeso(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

export default async function PagosPage({ searchParams }: Props) {
  const mesPorDefecto = new Date().toISOString().slice(0, 7)
  const params = await searchParams
  const mes    = params.mes ?? mesPorDefecto
  const pagos  = await getPagos(mes)

  const totalMes = pagos.reduce((s, p) => s + (p.importe ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Pagos</h1>
          <Button render={<Link href="/comercial/pagos/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
        <SelectorMes mes={mes} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Total pagado {mes}</p>
            <p className="text-3xl font-bold text-destructive">
              {fmtPeso(totalMes)}
            </p>
          </CardContent>
        </Card>

        {pagos.length === 0 ? (
          <EmptyState
            icon={ArrowDownLeft}
            title="Sin pagos"
            message="No hay pagos registrados para este mes"
            action={<Button render={<Link href="/comercial/pagos/nueva" />} variant="outline">Registrar pago</Button>}
          />
        ) : (
          <div className="space-y-3">
            {pagos.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {(p.proveedores as unknown as { nombre: string } | null)?.nombre ??
                         (p.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.fecha} · {p.medio_pago_id}</p>
                    </div>
                    <p className="font-bold text-lg text-destructive">
                      {fmtPeso(p.importe as number)}
                    </p>
                  </div>
                  {p.observacion && (
                    <p className="text-xs text-muted-foreground">{p.observacion as string}</p>
                  )}
                  <AnularButton onAnular={anularPago.bind(null, p.id)} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * @system     FlowAluminio
 * @module     app/admin/cobros/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de cobros del mes — mobile-first
 */
import Link from 'next/link'
import { Plus, DollarSign, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorMes } from '@/components/selector-mes'
import { EmptyState } from '@/components/empty-state'
import { getCobros, anularCobro } from '@/app/(admin)/cobros/actions'
import { AnularButton } from '@/components/anular-button'

interface Props { searchParams: Promise<{ mes?: string }> }

export default async function CobrosPage({ searchParams }: Props) {
  const mesPorDefecto = new Date().toISOString().slice(0, 7)
  const params = await searchParams
  const mes    = params.mes ?? mesPorDefecto
  const cobros = await getCobros(mes)

  const totalMes = cobros.reduce((s, c) => s + (c.importe ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Cobros</h1>
          <Button render={<Link href="/admin/cobros/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
        <SelectorMes mes={mes} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Total cobrado {mes}</p>
            <p className="text-3xl font-bold text-green-600">
              ${totalMes.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        {cobros.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Sin cobros"
            message="No hay cobros registrados para este mes"
            action={<Button render={<Link href="/admin/cobros/nueva" />} variant="outline">Registrar cobro</Button>}
          />
        ) : (
          <div className="space-y-3">
            {cobros.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {(c.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.fecha} · {c.medio_pago_id}</p>
                    </div>
                    <p className="font-bold text-lg text-green-600">
                      ${(c.importe as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/cobros/${c.id}/editar`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                    <AnularButton onAnular={anularCobro.bind(null, c.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

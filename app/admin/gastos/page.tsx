/**
 * @system     FlowAluminio
 * @module     app/admin/gastos/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de gastos del día — mobile-first
 */
import Link from 'next/link'
import { Plus, Receipt, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorFecha } from '@/components/selector-fecha'
import { EmptyState } from '@/components/empty-state'
import { getGastos, anularGasto } from '@/app/(admin)/gastos/actions'
import { AnularButton } from '@/components/anular-button'

interface Props { searchParams: Promise<{ fecha?: string }> }

export default async function GastosPage({ searchParams }: Props) {
  const hoy    = new Date().toISOString().split('T')[0]
  const params = await searchParams
  const fecha  = params.fecha ?? hoy
  const gastos = await getGastos(fecha)

  const totalHoy = gastos.reduce((s, g) => s + (g.importe ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Gastos</h1>
          <Button render={<Link href="/admin/gastos/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
        <SelectorFecha fecha={fecha} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Total gastado hoy</p>
            <p className="text-3xl font-bold">
              ${totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        {gastos.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin gastos"
            message="No hay gastos registrados para este día"
            action={<Button render={<Link href="/admin/gastos/nueva" />} variant="outline">Registrar gasto</Button>}
          />
        ) : (
          <div className="space-y-3">
            {gastos.map((g) => (
              <Card key={g.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{g.concepto}</p>
                    <p className="font-bold text-lg">
                      ${(g.importe as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {(g.categorias_gasto as unknown as { nombre: string } | null)?.nombre && (
                      <span>{(g.categorias_gasto as unknown as { nombre: string }).nombre}</span>
                    )}
                    <span>{g.medio_pago_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/gastos/${g.id}/editar`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                    <AnularButton onAnular={anularGasto.bind(null, g.id)} />
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

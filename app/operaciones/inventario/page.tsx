/**
 * @system     FlowAluminio
 * @module     app/operaciones/inventario/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Inventario físico teórico calculado desde movimientos — mobile-first
 */
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getInventarioTeorico } from '@/app/(operaciones)/inventario/actions'

export default async function InventarioPage() {
  const inventario = await getInventarioTeorico()

  const totalSaldo = inventario.reduce((s, i) => s + i.kgSaldo, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Inventario</h1>
        <Button render={<Link href="/operaciones/inventario/conteo" />} size="sm" variant="outline" className="h-9">
          <ClipboardList className="h-4 w-4 mr-1" />
          Contar
        </Button>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Stock teórico total</p>
            <p className="text-3xl font-bold">{totalSaldo.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">kg (calculado desde movimientos)</p>
          </CardContent>
        </Card>

        {inventario.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventario.map((item) => (
              <Card key={item.clienteId}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.clienteNombre}</p>
                    <Badge
                      variant={item.kgSaldo >= 0 ? 'secondary' : 'destructive'}
                      className="text-base px-3"
                    >
                      {item.kgSaldo.toFixed(0)} kg
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Entradas: <strong>{item.kgRecibidos.toFixed(0)} kg</strong></span>
                    <span>Salidas: <strong>{item.kgDespachados.toFixed(0)} kg</strong></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground py-2">
          Stock calculado desde recepciones reconocidas y despachos. Realizá un conteo físico para verificar diferencias.
        </p>
      </main>
    </div>
  )
}

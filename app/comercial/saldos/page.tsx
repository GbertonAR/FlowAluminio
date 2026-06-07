/**
 * @system     FlowAluminio
 * @module     app/comercial/saldos/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Saldos físicos y financieros por cliente — ledger acumulado
 */
import { Scale } from 'lucide-react'
import { getSaldosClientes } from '@/app/(comercial)/saldos/actions'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPeso(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

export default async function SaldosPage() {
  const saldos = await getSaldosClientes()

  const totalKgSaldo       = saldos.reduce((s, c) => s + c.kgSaldo, 0)
  const totalSaldoFinanciero = saldos.reduce((s, c) => s + c.saldoFinanciero, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Saldos por cliente</h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo físico total</p>
              <p className="text-xl font-bold">{fmt(totalKgSaldo)} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">A cobrar</p>
              <p className={`text-xl font-bold ${totalSaldoFinanciero > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {fmtPeso(totalSaldoFinanciero)}
              </p>
            </CardContent>
          </Card>
        </div>

        {saldos.length === 0 ? (
          <EmptyState icon={Scale} title="Sin movimientos" message="No hay recepciones ni despachos registrados aún" />
        ) : (
          <div className="space-y-3">
            {saldos.map((c) => (
              <Card key={c.clienteId}>
                <CardContent className="py-3 space-y-2">
                  <p className="font-semibold">{c.clienteNombre}</p>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Recibidos</p>
                      <p className="font-medium">{fmt(c.kgRecibidos)} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Despachados</p>
                      <p className="font-medium">{fmt(c.kgDespachados)} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Saldo</p>
                      <p className={`font-bold ${c.kgSaldo >= 0 ? '' : 'text-destructive'}`}>
                        {fmt(c.kgSaldo)} kg
                      </p>
                    </div>
                  </div>
                  {c.importeValorizado > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>Valorizado: <strong>{fmtPeso(c.importeValorizado)}</strong></span>
                      <span>Cobrado: <strong>{fmtPeso(c.importeCobrado)}</strong></span>
                      <span className={c.saldoFinanciero > 0 ? 'text-green-600 font-semibold' : ''}>
                        Saldo: {fmtPeso(c.saldoFinanciero)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
